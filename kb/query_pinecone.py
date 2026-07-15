"""
Семантический поиск по AWARA KB через Pinecone (local embeddings).
"""

import os
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone

load_dotenv()

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index(os.getenv("PINECONE_INDEX_NAME", "awara-kb"))
print("Loading model...")
model = SentenceTransformer("all-MiniLM-L6-v2")

def search(query: str, top_k: int = 5):
    emb = model.encode("query: " + query, normalize_embeddings=True).tolist()
    results = index.query(vector=emb, top_k=top_k, include_metadata=True)
    return [
        {"file": m.metadata.get("file","?"), "text": m.metadata.get("text","")[:300], "score": m.score}
        for m in results.matches
    ]

if __name__ == "__main__":
    import sys
    q = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else input("Query: ")
    print(f"\n>> {q}\n")
    for r in search(q):
        print(f"[{r['score']:.3f}] {r['file']}")
        print(f"  {r['text'][:200]}\n")
