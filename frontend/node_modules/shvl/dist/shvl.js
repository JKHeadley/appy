exports.get=function(t,e,n){return void 0===(t=(e.split?e.split("."):e).reduce(function(t,e){return t&&t[e]},t))?n:t},exports.set=function(t,e,n,r){return(e=e.split?e.split("."):e).slice(0,-1).reduce(function(t,e){return t[e]=t[e]||{}},t)[e.pop()]=n,t};
//# sourceMappingURL=shvl.js.map
