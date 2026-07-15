/* ===== AWARA · Эфемеридное ядро (алгоритм Schlyter, точность ~1-2') ===== */
/* Переопределяет window.computeNatal: точные сидерические долготы (Лахири). */
/* Сверено по дате 17.05.1991: Солнце Телец~2, Раху Стрелец~28, Луна Близнецы~15-18 (Ардра). */
(function(){
'use strict';
if(window.AwaraEph&&window.AwaraEph.__ready)return;
var D2R=Math.PI/180,R2D=180/Math.PI;
function rev(x){return ((x%360)+360)%360;}
function sind(x){return Math.sin(x*D2R);}
function cosd(x){return Math.cos(x*D2R);}
function tand(x){return Math.tan(x*D2R);}
function atan2d(y,x){return R2D*Math.atan2(y,x);}

/* день от 2000 Jan 0.0 (JD 2451543.5), дробный с UT */
function dayNo(Y,M,D,ut){
  var d=367*Y - Math.floor(7*(Y+Math.floor((M+9)/12))/4) + Math.floor(275*M/9) + D - 730530;
  return d + ut/24.0;
}
function jd(Y,M,D,ut){return dayNo(Y,M,D,ut)+2451543.5;}

/* Лахири (True/Chitrapaksha), настроено на Drik: 23.7433 на 1991-05 */
function ayanamsa(d){
  var T=(d+2451543.5-2451545.0)/36525.0;
  return 23.8637 + 1.3969*T;
}
function obliquity(d){return 23.4393 - 3.563e-7*d;}

function eccAnom(M,e){
  M=rev(M);
  var E=M + R2D*e*sind(M)*(1+e*cosd(M));
  for(var i=0;i<14;i++){
    var dE=(E - R2D*e*sind(E) - M)/(1 - e*cosd(E));
    E-=dE;
    if(Math.abs(dE)<1e-9)break;
  }
  return E;
}

function helio(N,i,w,a,e,M){
  var E=eccAnom(M,e);
  var xv=a*(cosd(E)-e);
  var yv=a*Math.sqrt(1-e*e)*sind(E);
  var v=atan2d(yv,xv);
  var r=Math.sqrt(xv*xv+yv*yv);
  var vw=v+w;
  var x=r*(cosd(N)*cosd(vw)-sind(N)*sind(vw)*cosd(i));
  var y=r*(sind(N)*cosd(vw)+cosd(N)*sind(vw)*cosd(i));
  var z=r*sind(vw)*sind(i);
  return {x:x,y:y,z:z,r:r,lon:rev(atan2d(y,x))};
}

function sunData(d){
  var w=282.9404+4.70935e-5*d;
  var e=0.016709-1.151e-9*d;
  var M=rev(356.0470+0.9856002585*d);
  var E=eccAnom(M,e);
  var xv=cosd(E)-e,yv=Math.sqrt(1-e*e)*sind(E);
  var v=atan2d(yv,xv),r=Math.sqrt(xv*xv+yv*yv);
  var lon=rev(v+w);
  return {lon:lon,r:r,M:M,w:w,Ls:rev(M+w),x:r*cosd(lon),y:r*sind(lon)};
}

function moonLon(d){
  var N=125.1228-0.0529538083*d;
  var i=5.1454;
  var w=318.0634+0.1643573223*d;
  var e=0.054900;
  var M=rev(115.3654+13.0649929509*d);
  var h=helio(N,i,w,1,e,M);
  var lon=h.lon;
  var sun=sunData(d);
  var Ms=sun.M,Ls=sun.Ls;
  var Lm=rev(N+w+M);
  var Dl=rev(Lm-Ls);
  var F=rev(Lm-N);
  lon += -1.274*sind(M-2*Dl)
       + 0.658*sind(2*Dl)
       - 0.186*sind(Ms)
       - 0.059*sind(2*M-2*Dl)
       - 0.057*sind(M-2*Dl+Ms)
       + 0.053*sind(M+2*Dl)
       + 0.046*sind(2*Dl-Ms)
       + 0.041*sind(M-Ms)
       - 0.035*sind(Dl)
       - 0.031*sind(M+Ms)
       - 0.015*sind(2*F-2*Dl)
       + 0.011*sind(M-4*Dl);
  return rev(lon);
}

var PLAN={
 'Меркурий':function(d){return {N:48.3313+3.24587e-5*d,i:7.0047+5.00e-8*d,w:29.1241+1.01444e-5*d,a:0.387098,e:0.205635+5.59e-10*d,M:rev(168.6562+4.0923344368*d)};},
 'Венера':function(d){return {N:76.6799+2.46590e-5*d,i:3.3946+2.75e-8*d,w:54.8910+1.38374e-5*d,a:0.723330,e:0.006773-1.302e-9*d,M:rev(48.0052+1.6021302244*d)};},
 'Марс':function(d){return {N:49.5574+2.11081e-5*d,i:1.8497-1.78e-8*d,w:286.5016+2.92961e-5*d,a:1.523688,e:0.093405+2.516e-9*d,M:rev(18.6021+0.5240207766*d)};},
 'Юпитер':function(d){return {N:100.4542+2.76854e-5*d,i:1.3030-1.557e-7*d,w:273.8777+1.64505e-5*d,a:5.20256,e:0.048498+4.469e-9*d,M:rev(19.8950+0.0830853001*d)};},
 'Сатурн':function(d){return {N:113.6634+2.38980e-5*d,i:2.4886-1.081e-7*d,w:339.3939+2.97661e-5*d,a:9.55475,e:0.055546-9.499e-9*d,M:rev(316.9670+0.0334442282*d)};}
};

function planetGeoLon(name,d){
  var el=PLAN[name](d);
  var h=helio(el.N,el.i,el.w,el.a,el.e,el.M);
  var sun=sunData(d);
  var lon=rev(atan2d(h.y+sun.y,h.x+sun.x));
  if(name==='Юпитер'||name==='Сатурн'){
    var Mj=PLAN['Юпитер'](d).M,Mss=PLAN['Сатурн'](d).M;
    if(name==='Юпитер'){
      lon += -0.332*sind(2*Mj-5*Mss-67.6)
           - 0.056*sind(2*Mj-2*Mss+21)
           + 0.042*sind(3*Mj-5*Mss+21)
           - 0.036*sind(Mj-2*Mss)
           + 0.022*cosd(Mj-Mss)
           + 0.023*sind(2*Mj-3*Mss+52)
           - 0.016*sind(Mj-5*Mss-69);
    } else {
      lon += 0.812*sind(2*Mj-5*Mss-67.6)
           - 0.229*cosd(2*Mj-4*Mss-2)
           + 0.119*sind(Mj-2*Mss-3)
           + 0.046*sind(2*Mj-6*Mss-69)
           + 0.014*sind(Mj-3*Mss+32);
    }
  }
  return rev(lon);
}

function nodeLon(d){return rev(125.1228-0.0529538083*d);}

function ascendant(d,ut,lat,lonEast){
  var sun=sunData(d);
  var gmst0=rev(sun.Ls+180);
  var lst=rev(gmst0 + ut*15.04106864 + lonEast);
  var ramc=lst;
  var ecl=obliquity(d);
  var asc=atan2d(cosd(ramc), -(sind(ramc)*cosd(ecl)+tand(lat)*sind(ecl)));
  return rev(asc);
}

function computeNatal(b){
  b=b||{};
  var dp=String(b.date||'01.01.2000').split('.').map(Number);
  var tp=String(b.time||'12:00').split(':').map(Number);
  var D=dp[0]||1,M=dp[1]||1,Y=dp[2]||2000;
  var hh=tp[0]||0,mm=tp[1]||0,tz=(+b.tz||0);
  var lat=(b.lat!=null?+b.lat:0),lon=(b.lon!=null?+b.lon:0);
  var ut=hh+mm/60 - tz;
  var d=dayNo(Y,M,D,ut);
  var ay=ayanamsa(d);
  function sid(t){return rev(t-ay);}
  var bodies={},retro={};
  bodies['Лагна']=sid(ascendant(d,ut,lat,lon));
  bodies['Солнце']=sid(sunData(d).lon);
  bodies['Луна']=sid(moonLon(d));
  ['Меркурий','Венера','Марс','Юпитер','Сатурн'].forEach(function(p){
    bodies[p]=sid(planetGeoLon(p,d));
    var a1=planetGeoLon(p,d-0.5),a2=planetGeoLon(p,d+0.5);
    var diff=((a2-a1+540)%360)-180;
    retro[p]=diff<0;
  });
  var rah=nodeLon(d);
  bodies['Раху']=sid(rah);
  bodies['Кету']=sid(rev(rah+180));
  retro['Раху']=true;retro['Кету']=true;
  return {bodies:bodies,retro:retro,ay:Math.round(ay*100)/100};
}

window.computeNatal=computeNatal;
window.AwaraEph={__ready:true,computeNatal:computeNatal,moonLon:moonLon,sunData:sunData,planetGeoLon:planetGeoLon,ayanamsa:ayanamsa,jd:jd};
})();
