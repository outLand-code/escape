


// eslint-disable-next-line no-unused-vars
let node_list_limit=10 ,deep_limit=5
let cal_rul=[
    [cal_rul_0,cal_rul_0,cal_rul_1,cal_rul_1],
    [cal_rul_1,cal_rul_0,cal_rul_0,cal_rul_1],
    [cal_rul_0,cal_rul_1,cal_rul_1,cal_rul_0],
    [cal_rul_1,cal_rul_1,cal_rul_0,cal_rul_0]
]

function cal_rul_0 ( x){
    return x;
}
function cal_rul_1(x1, x2){
    return Math.abs(x2-x1)/2+Math.min(x1,x2)
}

class Point{
    constructor(x,y) {
        this.x=x
        this.y=y
    }
}

class QNode{
    //top_left , top_right ,bot_left,bot_right
    range
    list

    constructor( tl ,br,deep_count ,deep_limit,v) {
        this.p_tl=tl
        this.p_br=br
        this.deep_count=deep_count
        this.deep_limit=deep_limit
        this.v=v
    }


    insert(x,y ,x1 ,y1,x2,y2,v,s){

        if (x>this.p_br.x || x<this.p_tl.x || y>this.p_br.y || y<this.p_tl.y)
            return false


        if (this.deep_count===this.deep_limit){
            if (this.list===undefined)
                this.list=[]
            this.list.push(new QNode(new Point(x1,y1),new Point(x2,y2),this.deep_count+1,this.deep_limit,v))
            if (s!==undefined)
            {
                s.fill(255, 0, 0)
                s.circle(x, y, 2)
                s.circle(x2, y2, 1)
            }
            return true
        }


        if (this.range===undefined){
            // console.log(this.p_tl,this.p_br)
            if (s!==undefined){
                s.noFill()
                s.stroke('red')
                s.rect(this.p_tl.x, this.p_tl.y, this.p_br.x-this.p_tl.x, this.p_br.y-this.p_tl.y)
            }


            this.range=new Array(4)
            for (let i =0 ;i<cal_rul.length;i++)
            {
                let n_x1= cal_rul[i][0](this.p_tl.x,this.p_br.x) ,n_y1=cal_rul[i][1](this.p_tl.y,this.p_br.y) ,
                    n_x2= cal_rul[i][2](this.p_br.x,this.p_tl.x) ,n_y2=cal_rul[i][3](this.p_br.y,this.p_tl.y)
                this.range[i]=new QNode(new Point(n_x1,n_y1),new Point(n_x2,n_y2),this.deep_count+1,this.deep_limit)

                if (s!==undefined){
                    s.noFill()
                    s.stroke('red')
                    s.rect(n_x1, n_y1, n_x2-n_x1,n_y2-n_y1)
                    // s.fill(255, 0, 0)
                    // s.circle(n_x1, n_y1, 5)
                    // s.circle(n_x2, n_y2, 5)
                }


            }
        }

        for (let i=0;i<this.range.length;i++)
        {
            if (this.range[i].insert(x,y,x1 ,y1,x2,y2,v,s))
                return true
        }
    }
    collision (x,y,x1, y1,x2,y2)
    {
        if (this===undefined)
            return {flag:false,rs:null}

        if (x>this.p_br.x || x<this.p_tl.x || y>this.p_br.y || y<this.p_tl.y)
            return {flag:false,rs:null}

        if (this.deep_count===deep_limit && this.list!==undefined ) {

            let ans=[]
            this.list.forEach(node=>{
                let flag=0
                if (x1< node.p_tl.x && x2<node.p_tl.x || x1 > node.p_br.x &&  x2>node.p_br.x)
                    flag|=1
                if (y1 <node.p_tl.y && y2< node.p_tl.y || y1 >node.p_br.y && y2>node.p_br.y)
                    flag|=2

                if (flag===0)
                    ans.push({tl:node.p_tl,br:node.p_br,v:node.v})
            })

            return {flag:true ,region:{tl:this.p_tl ,br:this.p_br}, ans:ans,x:x,y:y}
        }
        if (this.range===undefined)
            return {flag:false,rs:null}

        for (let i=0;i<this.range.length;i++)
        {
            let  res =this.range[i].collision(x,y,x1, y1,x2,y2)
            if ( res.flag)
                return res
        }
        return {flag:false,rs:null}

    }

    delete (x,y,x1, y1,x2,y2){
        if (x>this.p_br.x || x<this.p_tl.x || y>this.p_br.y || y<this.p_tl.y)
            return false


        if (this.deep_count===this.deep_limit && this.list!==undefined){
            this.list.forEach((node, index, arr)=>{
                if (x1===node.p_tl.x && y1 === node.p_tl.y && x2 ===node.p_br.x && y2===node.p_br.y)
                    arr.splice(index,1)
            })
            return true
        }

        if (this.range===undefined){
            return true
        }

        for (let i=0;i<this.range.length;i++)
        {
            if (this.range[i].delete(x,y,x1 ,y1,x2,y2))
                return true
        }
    }

    insert_for(x1,y1,x2,y2,v,s){
        this.insert(x1,y1, x1,y1,x2,y2,v,s)
        this.insert(x1,y2, x1,y1,x2,y2,v,s)
        this.insert(x2,y1, x1,y1,x2,y2,v,s)
        this.insert(x2,y2, x1,y1,x2,y2,v,s)
    }

    collision_rect_point_for(x1,y1,x2,y2){
        return [
            this.collision_point(x1,y1),
            this.collision_point(x2,y1),
            this.collision_point(x2,y2),
            this.collision_point(x1,y2),
        ]
    }
    collision_point(x,y){
        return this.collision(x,y,x,y,x,y)
    }

    delete_for(x1,y1,x2,y2){
        this.delete(x1,y1, x1,y1,x2,y2)
        this.delete(x1,y2, x1,y1,x2,y2)
        this.delete(x2,y1, x1,y1,x2,y2)
        this.delete(x2,y2, x1,y1,x2,y2)
    }



}


module.exports = {
    init:init_root,
    create_sd:create_sd,
    create_node:create_node

}
function init_root( x1,y1,x2,y2,dl){
    return new QNode(new Point(x1,y1),new Point(x2,y2),1,dl)
}


class LinkNode{
    next
    constructor(id , v ) {
        this.id = id
        this.v = v
    }

    setNext( node ){
        this.next=node
    }
}

class SDNode{
    constructor(root , last, limit) {
        this.root=root
        this.last=last
        this.limit=limit
    }

}
function create_node(id,v){
    return new LinkNode(id, v )
}

function create_sd(limit,v){
    let node =new LinkNode(0,v,limit)
    return new SDNode(node,node,limit)
}