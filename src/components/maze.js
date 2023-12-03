


let matrix =[],dirs=[[1,0],[-1,0],[0,1],[0,-1]]
let degree, base_n,base_m
// eslint-disable-next-line no-unused-vars
let pos_start ,pos_end
let repeat=10
let count_repeat=0


module.exports = {
    create:create
}

function create(d,r){
    if ( d ===undefined)
        d=9
    if (r!==undefined)
        repeat=r
    matrix=[]
    degree = d
    base_n=degree*2
    base_m =base_n
    initMatrix()
    randomPrim()
    let dif = difficult_n()
    return {
        matrix:matrix,
        difficult: dif,
        pos_start:pos_start,
        pos_end:pos_end
    }


}


function initMatrix(){
    let m= base_m%2===0?base_m:base_m+1, n=base_n

    for (let i=-1;i<m;i++)
    {
        let in_m=[1],isOdd=true
        if (i%2===0)
            isOdd=false
        for (let j=0;j<n;j++)
        {
            in_m[j+1]= !isOdd && j%2===0?0:1
        }
        matrix[i+1]=in_m
    }

    if (base_m<=6){
        matrix[1][0]=0
        matrix[m-1][n]=0
        pos_start=[1,0]
        pos_end=[m-1,n+1]
    }else{
        matrix[3][0]=0
        matrix[m-3][n]=0
        pos_start=[3,0]
        pos_end=[m-2,n+1]
    }
}

function randomPrim(){
    let peeks=new Map()

    for (let i =0;i<matrix.length;i++)
    {
        for (let j = 0; j < matrix[i].length; j++)
        {
            if (matrix[i][j]!==0)
                continue
            let arounds=[]
            dirs.forEach(dir=>{
                for (let n_x=i+dir[0], n_y=j+dir[1];
                     n_x<matrix.length&& n_x>0 && n_y<matrix[i].length&& n_y>0;
                     n_x+=dir[0],n_y+=dir[1]){
                    if (matrix[n_x][n_y]===0){
                        arounds.push([n_x,n_y])
                        break
                    }

                }
            })
            peeks.set(i+'_'+j,arounds)
        }
    }



    let passed=new Map(), peek=peeks.get(pos_start[0]+'_'+pos_start[1])
    dfs(pos_start,null,peek)
    function dfs(p,last_p,peek){

        if (peek===null)
            return
        if (peek.length<1)
            return
        if (passed.has(p[0]+'_'+p[1])){
            if (++count_repeat%repeat!==0)
                return
        }

        if (last_p!==null){
            let in_last=peek.findIndex(item => item.join() === last_p.join())
            if ( in_last!==-1){
                peek.splice(in_last,1)
            }
            if (last_p[0]===p[0]){
                let dir=last_p[1]>p[1]?1:-1
                for (let i=p[1]+dir;(i>p[1] && i<last_p[1]) || (i>last_p[1] && i<p[1]);i+=dir){
                    matrix[last_p[0]][i]=0
                }
            }else if(last_p[1]===p[1]){
                let dir=last_p[0]>p[0]?1:-1
                for (let i=p[0]+dir;(i>p[0] && i<last_p[0]) || (i>last_p[0] && i<p[0]);i+=dir){
                    matrix[i][last_p[1]]=0
                }
            }
        }
        passed.set(p[0]+'_'+p[1],null)
        while(peek.length>0){
            let i=Math.floor(Math.random()*(peek.length))
            let n_p=peek[i]
            dfs(n_p,p,peeks.get(n_p[0]+'_'+n_p[1]))
            peek.splice(i,1)
        }
    }

}


function difficult_n(){
    let count=0;
    for (let i=0;i<matrix.length;i++)
    {
        for (let j=0;j<matrix[i].length;j++)
        {
            if (matrix[i][j]!==0)
                continue
            let x_n=matrix[i+dirs[0][0]][j+dirs[0][1]]^matrix[i+dirs[1][0]][j+dirs[1][1]]
            let y_n=matrix[i+dirs[2][0]][j+dirs[2][1]]^matrix[i+dirs[3][0]][j+dirs[3][1]]
            if (x_n+y_n>0)
                count++
        }
    }
    let n =base_n/2
    return [count,(count/(n*n)).toFixed(4)]
}