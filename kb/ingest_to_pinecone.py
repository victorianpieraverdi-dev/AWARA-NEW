"""
AWARA Knowledge Base → Pinecone (local embeddings)
"""

import os, hashlib, time
from pathlib import Path
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone

load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "awara-kb")
WIKI_DIR = Path(__file__).parent / "wiki"

if not PINECONE_API_KEY:
    raise RuntimeError("Set PINECONE_API_KEY in .env")

print("Loading embedding model...")
model = SentenceTransformer("all-MiniLM-L6-v2")
EMBED_DIM = 384

print("Connecting to Pinecone...")
pc = Pinecone(api_key=PINECONE_API_KEY)

# Create index if needed
existing = [idx.name for idx in pc.list_indexes()]
if INDEX_NAME not in existing:
    print(f"Creating index '{INDEX_NAME}' ({EMBED_DIM}d)...")
    pc.create_index(
        name=INDEX_NAME,
        dimension=EMBED_DIM,
        metric="cosine",
        spec={"serverless": {"cloud": "aws", "region": "us-east-1"}}
    )
    print("Waiting 45s for provisioning...")
    time.sleep(45)

index = pc.Index(INDEX_NAME)

def embed(text: str) -> list[float]:
    # multilingual-e5 wants "query: " prefix for queries, "passage: " for documents
    return model.encode("passage: " + text[:2000], normalize_embeddings=True).tolist()

def chunk_text(text: str, max_chars: int = 800) -> list[str]:
    """Chunk by ## headers, max max_chars"""
    chunks, current = [], ""
    for line in text.split("\n"):
        if line.startswith("## ") and current.strip():
            chunks.append(current.strip())
            current = line + "\n"
        else:
            current += line + "\n"
    if current.strip():
        chunks.append(current.strip())
    # Split long chunks
    result = []
    for c in chunks:
        if len(c) > max_chars:
            for i in range(0, len(c), max_chars):
                result.append(c[i:i+max_chars])
        else:
            result.append(c)
    return result

def ingest():
    md_files = list(WIKI_DIR.rglob("*.md"))
    print(f"Found {len(md_files)} markdown files\n")

    total_vectors = 0
    for i, fpath in enumerate(md_files):
        rel = str(fpath.relative_to(WIKI_DIR.parent))
        try:
            content = fpath.read_text(encoding="utf-8")
        except:
            continue
        if len(content) < 30:
            continue

        chunks = chunk_text(content)
        vectors = []
        for ci, chunk in enumerate(chunks):
            if len(chunk) < 30:
                continue
            vid = hashlib.md5(f"{rel}#{ci}".encode()).hexdigest()
            try:
                emb = embed(chunk)
            except Exception as e:
                print(f"  Embed error {rel}: {e}")
                continue
            vectors.append({
                "id": vid, "values": emb,
                "metadata": {"file": rel, "chunk": ci, "text": chunk[:400]}
            })

        if vectors:
            index.upsert(vectors=vectors)
            total_vectors += len(vectors)

        if (i+1) % 20 == 0:
            print(f"  {i+1}/{len(md_files)} files ({total_vectors} vectors)")

    stats = index.describe_index_stats()
    print(f"\nDone! {total_vectors} vectors in '{INDEX_NAME}'")
    print(f"Total: {stats.total_vector_count}, Dim: {stats.dimension}")

if __name__ == "__main__":
    ingest()
