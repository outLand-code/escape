
let m_beta=1 , memory_dirs=[1, 1, 0, 1]

function base_p_dirs(){
    let d = [10,10,10,10,10,10,10,10] ,sum=80
    for (let i =0;i<memory_dirs.length;i++){
        if (memory_dirs[i]===0){
            let n=i*2+5,n_i = n>7? n%8: n  ,
                m_1= m_beta
            d[n_i] += m_1
            sum+=m_1

        }
            // n_i_1= (n_i+1) >7? (n_i+1)%8: n_i+1,
            // n_i_2= (n_i+2) >7? (n_i+2)%8: n_i+2,
        // d[n_i_1] += m_1
        // d[n_i_2] += m_1
    }
    return {d: d , sum:sum}
}
let c =base_p_dirs()
console.log(c)


let ans =[1,2,3,4,5]

console.log(ans)
ans.forEach(function(item, index, arr) {
    if(item === 4) {
        arr.splice(index, 1);
    }
})
console.log(ans)
