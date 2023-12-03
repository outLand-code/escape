

const maze_example = require('./maze_example');
const maze = require('./maze');
const qnode = require('./qnode')
// eslint-disable-next-line no-unused-vars
const store =require('./tset.js')


import p5 from 'p5'
import {Pane} from 'tweakpane'
const pane =new Pane()
const canvas_width=1200,canvas_height=1200, base_x=10,base_y=10,width_wall=40,width_path=40

let maze_drawn=false, e_p5=null ,e_container

const PARAMS = {
    ant_limit_init: 5,
    ant_limit: 100,
    time_gap: 10,
    sd_limit_wall: 2,
    sd_limit_ph: 5,
    inertia_ph_base_limit: 5,
    m_beta: 10,
    p_beta: 100,
    p_damp: 2,
    ph_time_gap: 10,
    maze_degree:9,
    maze_index:0,
    maze:maze_example.maze[0],
    maze_pos_start:maze_example.pos_start,
    maze_pos_end: maze_example.pos_end,
    maze_difficult:null,
    maze_repeat:10,
    start_x:width_wall+base_x,
    start_y:null,
    end_x:null,
    end_y:null,
    count_end:0,
    count_total:0

};


// eslint-disable-next-line no-unused-vars
let end_flag=true,end_ph_id=undefined


// eslint-disable-next-line no-unused-vars
let degreesArray=[
    [9,9]

]

let ant_param=pane.addFolder({
    title: '蚂蚁个体参数',
    expanded: true,
});
let other_param=pane.addFolder({
    title: '其他参数',
    expanded: true,
});
let maze_param=pane.addFolder({
    title: '迷宫',
    expanded: true,
});
let st_param=pane.addFolder({
    title: '统计',
    expanded: true,
});
ant_param.addBinding(PARAMS, 'ant_limit_init', { label: '每次出生数量',min: 1, max: 200, step: 5 });
ant_param.addBinding(PARAMS, 'ant_limit', { label: '可存活总数量' ,min: 10, max: 2000, step: 50  });
ant_param.addBinding(PARAMS, 'time_gap', { label: '出生间隔时间/秒',min: 1, max: 60, step: 5  });
ant_param.addBinding(PARAMS, 'sd_limit_wall', { label: '墙体记忆数量',min: 1, max: 10, step: 1 });
ant_param.addBinding(PARAMS, 'sd_limit_ph', { label: '信息素记忆数量' ,min: 1, max: 10, step: 1 });
ant_param.addBinding(PARAMS, 'inertia_ph_base_limit', { label: '信息素记忆衰减次数' ,min: 1, max: 20, step: 1});
other_param.addBinding(PARAMS, 'm_beta', { label: '墙体系数' ,min: 10, max: 100, step: 10});
other_param.addBinding(PARAMS, 'p_beta', { label: '信息素系数',min: 10, max: 100, step: 10 });
other_param.addBinding(PARAMS, 'p_damp', { label: '信息素衰减系数',min: 1, max: 5, step: 1 });
other_param.addBinding(PARAMS, 'ph_time_gap', { label: '信息素衰减间隔时间/秒',min: 1, max: 60, step: 5 });
let maze_b=maze_param.addBinding(PARAMS,'maze_index' , {view: 'list', label: '可选迷宫',
    options: [{text: '迷宫0', value: 0}, {text: '迷宫1', value: 1}, {text: '迷宫2', value: 2},],})
let maze_degree=maze_param.addBinding(PARAMS,'maze_degree' , {view: 'list', label: '系数',
    options: [{text: '9', value: 9}, {text: '13', value: 13}],value:9})
maze_param.addBinding(PARAMS, 'maze_repeat', { label: '重复余数',min: 2, max: 200, step: 5 });

let maze_c_btu=maze_param.addButton({
    title: '创建新迷宫'
});

maze_b.on('change', function(ev) {
    PARAMS.maze_index=ev.value
    PARAMS.maze=maze_example.maze[ev.value]
    start(e_container)
});
maze_degree.on('change', function(ev) {
    PARAMS.maze_degree=ev.value
});
maze_c_btu.on('click', () => {
    crate_maze(PARAMS.maze_degree,e_container)
});
st_param.addBinding({
    get countPerc() {
        return `${(PARAMS.count_end/PARAMS.count_total * 100).toFixed(2)}%`;
    }
}, 'countPerc', {
    readonly: true,
    view: 'text',
    label: '到达统计比'
});

// eslint-disable-next-line no-unused-vars
let q_root , p_root, ph_map
// eslint-disable-next-line no-unused-vars
let ants=[],ants_dead=[] ,add_flag=true
// eslint-disable-next-line no-unused-vars
let p_init=5,p_max=10,p_max_n=100,p_damp_time=10000
let  ph_flag=true,ph_count=0
// eslint-disable-next-line no-unused-vars
const move_dirs_d =[1/(20*Math.sqrt(2)), 1/20] ,move_dirs=[[-1,-1],[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0]]
const p_dirs_rul =[
    {
        index:0,
        c_pos:[1,3],
        c_true:[ [1,2] ,[6,7] ],
        f_pos:[0,3],
        c_false:[ [1,0,1,2] ,[0,1 ,7,6] ]
    },
    {
        index:2,
        c_pos:[0,2],
        c_true:[ [0,1] ,[3,4] ],
        f_pos: [0,1],
        c_false:[[-1,0 ,1,0] ,[0,1,3,4] ]
    },
    {
        index:4,
        c_pos:[1,3],
        c_true:[ [2,3] ,[5,6] ],
        f_pos: [1,2],
        c_false:[[0,-1,3,2] ,[-1,0,5,6] ]
    },
    {
        index:6,
        c_pos:[0,2],
        c_true:[ [0,7] ,[4,5] ],
        f_pos: [3,2],
        c_false:[[0,-1,7,0] ,[1,0,5,4] ]
    }
]

const ph_dirs_rul=[
    {
        index:0,
        dir:[1,1],
        rs_rul:{
            1:[1],
            2:[1,2],
            4:[7],
            5:[1,7],
            6:[1,2,3,7],
            8:[6,7],
            9:[1,5,6,7],
            10:[1,2,3,4,5,6,7]
        }
    },
    {
        index:2,
        dir:[-1,1],
        rs_rul:{
            1:[1],
            2:[1,0],
            4:[3],
            5:[1,3],
            6:[1,0,3,7],
            8:[3,4],
            9:[1,3,4,5],
            10:[1,0,3,4,5,6,7]
        }
    },
    {
        index:4,
        dir:[-1,-1],
        rs_rul:{
            1:[5],
            2:[5,6],
            4:[3],
            5:[5,3],
            6:[3,5,6,7],
            8:[2,3],
            9:[1,2,3,5],
            10:[1,2,3,0,5,6,7]
        }
    },
    {
        index:6,
        dir:[1,-1],
        rs_rul:{
            1:[5],
            2:[5,4],
            4:[7],
            5:[5,7],
            6:[3,5,4,7],
            8:[0,7],
            9:[0,1,5,7],
            10:[1,2,3,4,5,0,7]
        }
    }
]



class Ant {
    speed=10
    visibility=30
    color_rgb=[255,0,0]
    d=10
    d_h = this.visibility/2
    pheromone_side_length=10
    is_running = true
    memory_dirs=[0,0,0,0,0,0,0,0]
    v_h=this.visibility/3
    sd_dirs_node=qnode.create_sd(PARAMS.sd_limit_wall,[0,0,0,0,0,0,0,0])
    memory_ph=new Map
    sd_ph_node=qnode.create_sd(PARAMS.sd_limit_ph,0)
    inertia_ph=[0,0,0,0,0,0,0,0]
    inertia_ph_limit=PARAMS.inertia_ph_base_limit

    constructor(id,x, y) {
        this.id=id
        this.x=x
        this.y=y
    }


    move(s){
        if (!this.is_running)
            return
        let points=this.detection_point()


        let  bpd = this.base_p_dirs(),p_dirs=bpd.d , dirs_fill = bpd.sum
        // console.log("base:",p_dirs)
        let ph_col =this.ph_dirs(points,p_dirs,dirs_fill)
        p_dirs=ph_col.p_dirs
        dirs_fill=ph_col.dirs_fill
        // console.log("ph:",p_dirs)
        let wall_col=this.wall_dir(points,p_dirs)
        let damp=wall_col.damp, have_wall=wall_col.have_wall
        let random = Math.ceil(Math.random()*(dirs_fill-damp))
        // console.log("wall:",p_dirs)
        let sum =0, index
        for (let i = 0; i < p_dirs.length; i++) {
            if (random>=sum&& random <= p_dirs[i]+sum ){
                index =i
                break
            }else
                sum+=p_dirs[i]
        }
        // console.log(index)
        if (index!==undefined){

            this.mark(index,points,ph_col.i_map,ph_col.have_ph,s)
            this.x += this.speed*move_dirs[index][0]
            this.y += this.speed*move_dirs[index][1]
            if (have_wall)
                this.changed_wall_f(p_dirs)
        }
        this.sacrifice(index, points,s)
        // console.log('----------------------------')
    }

    sacrifice(index, points,s){
        if (this.x>PARAMS.end_x)
        {
            this.is_running=false
            PARAMS.count_end++

            this.memory_ph.forEach( a=>{
                let ph =ph_map.get(a)
                if (ph!==undefined){
                    ph.potency=p_max_n
                }
            })
            if (end_flag){
                let id =this.mark_1(index,[PARAMS.end_x,PARAMS.end_y,PARAMS.end_x+width_wall,PARAMS.end_y+width_wall],s,p_max_n)
                end_flag=false
                end_ph_id=id
            }else{
                let end_ph  =ph_map.get(end_ph_id)
                if (end_ph!==undefined){
                    end_ph.potency=p_max_n
                }
            }
        }
    }
    changed_wall_f(wall_flag){
        let node =qnode.create_node(this.sd_dirs_node.last.id+1,wall_flag)
        this.sd_dirs_node.last.setNext(node)
        this.sd_dirs_node.last=node
        let root_v
        if (node.id - this.sd_dirs_node.root.id>PARAMS.sd_limit_wall){
            let root = this.sd_dirs_node.root
            this.sd_dirs_node.root=root.next
            root.setNext(undefined)
            root_v=root.v
        }
        this.changed_m(wall_flag,root_v)

    }

    changed_m(wall_flag,root_v){
        for (let i =0 ; i<wall_flag.length;i++){
            if (wall_flag[i]===0)
                this.memory_dirs[i]=0
            else
                this.memory_dirs[i]+=wall_flag[i]
            if (root_v!==undefined &&this.memory_dirs[i]>0 )
                this.memory_dirs[i]= this.memory_dirs[i]-root_v[i]>0?this.memory_dirs[i]-root_v[i] : 0
        }

    }

    base_p_dirs(){
        let d = [10,10,10,10,10,10,10,10] ,sum=80
        for (let i =0;i<this.memory_dirs.length;i++){
            if (this.memory_dirs[i]>0){
                let m_1=PARAMS.m_beta
                // if (i>0&&i<7&&this.memory_dirs[i]>this.memory_dirs[i-1] && this.memory_dirs[i]>this.memory_dirs[i+1])
                //     m_1+=50
                d[i]+=m_1
                sum +=m_1
            }
        }

        return {d: d , sum:sum}
    }


    detection_point(){
        let top_left_x = this.x -this.d_h , top_left_y = this.y-this.d_h
        return [top_left_x, top_left_y ,top_left_x+this.visibility, top_left_y+this.visibility]
    }
    mark(index,points,i_map,have_ph,s){
        let k =i_map.get(index)
        if (k===undefined ){
            if (have_ph)
                return
            let id =this.mark_1(index,points,s,p_init)
            this.changed_m_ph(id)
        }else{
            let ph =ph_map.get(k)
            if (ph.potency<p_max)
                ph.potency+=1
            this.changed_m_ph(k)

        }
    }
    mark_1(index,points,s,p_init){
        let id =++ph_count
        p_root.insert_for(points[0], points[1] , points[2] ,points[3],id)
        s.fill(0,255,0,128)
        s.noStroke()
        s.rect(points[0], points[1],points[2]-points[0],points[3]-points[1])
        ph_map.set(id,{i:index,c_latest:new Date().getTime(),potency:p_init,points:points ,id :id})
        return id
    }

    changed_m_ph(k){
        if (this.memory_ph.has(k))
            return
        let node= qnode.create_node(this.sd_ph_node.last.id+1,k)

        this.sd_ph_node.last.setNext(node)
        this.sd_ph_node.last=node
        this.memory_ph.set(k,null)
        if (node.id - this.sd_ph_node.root.id>PARAMS.sd_limit_ph){
            let root = this.sd_ph_node.root
            this.sd_ph_node.root=root.next
            root.setNext(undefined)
            this.memory_ph.delete(root.v)
        }
    }


    ph_dirs(points,p_dirs,dirs_fill){
        let ph_col = p_root.collision_rect_point_for(points[0], points[1] ,points[2] ,points[3])
        let i_map=new Map,have_ph=false,change_ph=true
        let ph_dir=[0,0,0,0,0,0,0,0]
        ph_col.forEach((rs,i)=>{
            if (rs.flag && rs.ans.length>0){
                have_ph=true

                let max_a={potency:0}
                rs.ans.forEach(a=>{
                    if (this.memory_ph.has(a.v))
                        return
                    let ph=ph_map.get(a.v)
                    if (ph!==undefined){
                        if (ph.potency>max_a.potency){
                            max_a=a
                            max_a.potency=ph.potency
                            max_a.x=rs.x
                            max_a.y=rs.y
                        }
                    }
                })
                if (max_a.potency<1)
                    return
                change_ph=false
                let rul = ph_dirs_rul[i]

                if ( ph_dir[rul.index]< max_a.potency){
                    ph_dir[rul.index]=max_a.potency
                    i_map.set(rul.index,max_a.v)

                }

                let x1 = max_a.x+ rul.dir[0]*this.v_h , x2= x1+rul.dir[0]*this.v_h , y1 = max_a.y+rul.dir[1]*this.v_h , y2 = y1+rul.dir[1]*this.v_h
                let flag_x=0, flag_y=0
                if (x2>max_a.tl.x && x2 < max_a.br.x)
                    flag_x=2
                else if (x1 > max_a.tl.x && max_a.br.x)
                    flag_x=1

                if (y2 > max_a.tl.y && y2< max_a.br.y)
                    flag_y=2
                else if (y1 > max_a.tl.y && y1 < max_a.br.y)
                    flag_y=1
                let i_s_index =flag_y<<2|flag_x
                if (i_s_index===0)
                    return
                let i_s =rul.rs_rul[i_s_index]

                for (let j=0;j<i_s.length; j++ ){
                    if (ph_dir[i_s[j]]<max_a.potency){
                        ph_dir[i_s[j]]=max_a.potency
                        i_map.set(i_s[j],max_a.v)
                    }
                }

            }
        })
        if (change_ph && this.inertia_ph_limit-- >0){
            ph_dir=this.inertia_ph
        }else{
            this.inertia_ph_limit=PARAMS.inertia_ph_base_limit
        }
        // console.log(ph_dir)
        this.inertia_ph=ph_dir
        for (let i =0 ; i< p_dirs.length;i++)
        {
            if (ph_dir[i]>0){
                let add = ph_dir[i]*PARAMS.p_beta
                p_dirs[i]+=add
                dirs_fill+=add
            }
        }

        return {p_dirs:p_dirs ,dirs_fill:dirs_fill,i_map:i_map,have_ph:have_ph}
    }

    wall_dir(points,p_dirs){
        let rs_col = q_root.collision_rect_point_for(points[0], points[1] ,points[2] ,points[3])
        let damp  = 0, have_wall=false
        for (let i= 0 ;i<rs_col.length;i++){
            let rs = rs_col[i]
            if (rs.flag && rs.ans.length>0){
                let rul = p_dirs_rul[i]
                for (let j = 0; j < rul.c_pos.length; j++) {
                    let pos=rs_col[rul.c_pos[j]]
                    if (pos.flag && pos.ans.length>0){
                        rul.c_true[j].forEach(p_index=>{
                            let v =p_dirs[p_index]
                            p_dirs[p_index]=0
                            damp+=v
                        })

                    }else{
                        let x1 = rul.c_false[j][0]* this.v_h +rs.x ,y1 = rul.c_false[j][1]* this.v_h +rs.y
                        let x2 = 2*rul.c_false[j][0]* this.v_h  +rs.x ,y2 = 2*rul.c_false[j][1]* this.v_h +rs.y
                        let flag1=0 ,flag2=0
                        rs.ans.forEach( r=>{
                            if (x1< r.tl.x  || x1 > r.br.x )
                                flag1|=1
                            if (y1 <r.tl.y  || y1 > r.br.y )
                                flag1|=2
                            if (x2< r.tl.x  || x2 > r.br.x )
                                flag2|=1
                            if (y2 <r.tl.y  || y2 > r.br.y )
                                flag2|=2
                        })
                        if (flag1===0){
                            damp+=p_dirs[rul.c_false[j][2]]
                            p_dirs[rul.c_false[j][2]]=0
                        }

                        if (flag2===0){
                            damp+=p_dirs[rul.c_false[j][3]]
                            p_dirs[rul.c_false[j][3]]=0
                        }
                    }
                }
                let v =p_dirs[rul.index]
                p_dirs[rul.index]=0
                damp+=v
                have_wall=true
            }
        }
        if (points[0]<=base_x){
            damp+=p_dirs[0]
            p_dirs[0]=0
            damp+=p_dirs[7]
            p_dirs[7]=0
            damp+=p_dirs[6]
            p_dirs[6]=0
            have_wall=true
        }

        return {damp:damp,have_wall:have_wall}
    }


}





function sketch(s){
    s.setup=function (){
        s.createCanvas(canvas_width, canvas_height);
        s.background(0);
    }
    s.draw=function(){
        drawMaze(s)
        drawAnt(s)
    }
}

function drawMaze(s){
    // s.fill(0,255,0,128)
    // s.noStroke()
    // s.rect(PARAMS.end_x,PARAMS.end_y,width_wall,width_wall)
    if (maze_drawn)return
    maze_drawn=true
    let matrix=PARAMS.maze
    q_root=qnode.init(base_x ,base_y , matrix.length * width_wall+base_x   , matrix[0].length * width_wall+base_y ,5 )
    p_root=qnode.init(base_x ,base_y , matrix.length * width_wall+base_x   , matrix[0].length * width_wall+base_y ,5 )

    let x = base_x,y=base_y;
    for (let i =0 ; i<matrix.length;i++){
        y= i * width_path+base_y
        let n =matrix[i]
        for (let j=0;j<n.length;j++){
            if (n[j]===1){
                x= j * width_path+base_x
                s.fill(255, 255, 255,128)
                s.noStroke()
                s.square(x,y,width_wall)
                q_root.insert_for(x,y , x+width_wall ,y+width_wall,0)
            }
        }
    }
}

// eslint-disable-next-line no-unused-vars
let draw_flag=true

function drawAnt(s){


    if (add_flag){
        add_flag=false
        setTimeout(function (){
            initAnts()
            add_flag=true
        },PARAMS.time_gap*1000)
    }

    // if (ants_dead.length>0){
    //     ants_dead.forEach(ant=>{
    //         s.fill(0,0,0)
    //         s.circle(ant.x,ant.y,ant.d)
    //         s.noFill()
    //     })
    // }

    if (ph_flag){
        ph_flag=false
        setTimeout(function (){
            ph_timer(s)
            ph_flag=true
        },PARAMS.ph_time_gap*1000)
    }

    // if(ph_flag){
    //     ph_flag=false
    //     store.store.forEach(a=>{
    //         ph_map.set(a.key,a.value)
    //         p_root.insert_for(a.value.points[0], a.value.points[1] , a.value.points[2] ,a.value.points[3],a.key)
    //
    //         s.fill(0,255,0,128)
    //         s.noStroke()
    //         s.rect(a.value.points[0], a.value.points[1],a.value.points[2]-a.value.points[0],a.value.points[3]-a.value.points[1])
    //     })
    // }

    ants.forEach(ant=>{

        // if (draw_flag){

        s.fill(0,0,0)
        s.circle(ant.x,ant.y,ant.d)
        s.noFill()
        ant.move(s)
        // ant.is_running=true

        s.fill(ant.color_rgb[0],ant.color_rgb[1],ant.color_rgb[2])
        s.circle(ant.x,ant.y,ant.d)
        s.noFill()

        draw_flag=false

        //     setTimeout(function (){
        //         draw_flag=true
        //     },5000)
        // }



    })
}

// eslint-disable-next-line no-unused-vars
function ph_timer(s){
    for (let [k, v] of ph_map) {
        v.potency-=PARAMS.p_damp
        if (v.potency<1) {
            ph_map.delete(k);
            p_root.delete_for(v.points[0],v.points[1],v.points[2],v.points[3])
            s.fill(0,0,0)
            s.rect(v.points[0],v.points[1],v.points[2]-v.points[0],v.points[3]-v.points[1])
        }
    }
}

function initAnts(){
    for (let i=1;i<=PARAMS.ant_limit_init;i++)
    {
        ants.push(new Ant(i,PARAMS.start_x , PARAMS.start_y))
    }
    PARAMS.count_total+=PARAMS.ant_limit_init;
    if (ants.length>PARAMS.ant_limit){
        // let n_ants=ants.splice(ants.length-ant_limit)
        // ants_dead=ants
        // ants=n_ants
        ants=ants.splice(ants.length-PARAMS.ant_limit)

    }

}

export function start( container){

    if (e_p5!==null){
        e_p5.remove()
        ants=[]
        e_p5=null
    }
    maze_drawn=false
    q_root =null, p_root=null, ph_map=new Map
    PARAMS.count_end=0
    PARAMS.count_total=0
    end_flag=true
    end_ph_id=undefined
    PARAMS.start_y=base_y+(PARAMS.maze_pos_start[0]+0.5)*width_wall
    PARAMS.end_x = width_wall*(PARAMS.maze_pos_end[1]-1)+base_x
    PARAMS.end_y=base_y+ (PARAMS.maze_pos_end[0]-1)*width_wall
    PARAMS.
    e_container=container
    initAnts()
    e_p5=new p5(sketch,e_container)
}

export function crate_maze(degree,container){
    let res= maze.create(degree,PARAMS.maze_repeat)
    PARAMS.maze_index=-1
    PARAMS.maze =res.matrix
    PARAMS.maze_pos_start=res.pos_start
    PARAMS.maze_pos_end=res.pos_end
    PARAMS.maze_difficult=res.difficult
    start(container)
}

