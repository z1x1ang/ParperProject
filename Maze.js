class Maze{
constructor(){
//初始化主角位置
this.gridItems=document.getElementsByClassName('grid-item');
this.agent1Div = document.querySelector('.q-hero');
this.agent2Div = document.querySelector('.q-observer');
//初始化动作空间 0上 1下 2左 3右
this.action_space=[0,1,2,3]
//初始化陷阱位置
this.hell=[];
//初始化宝藏位置 2改
this.oval_pos//=[4];
// 初始化状态访问记录
this.visited = new Array(this.gridItems.length).fill(false);
}
reset(){
   this.gridItems[agent].appendChild(this.agent1Div);
   observer?this.gridItems[observer].appendChild(this.agent2Div):null
   //重置visited数组全为0
   this.visited.fill(false);
   //还原伪元素的标志
   observer?document.querySelector('.q-observer').classList.remove('new-style'):null;
   observer?document.querySelector('.q-observer').classList.remove('new-style2'):null;

   document.getElementById('cost*').textContent=dG1;
   document.getElementById('cost2*').textContent=dG2;
   document.getElementById("pg1").innerText=0.5;
   document.getElementById("pg2").innerText=0.5;
   document.getElementById('cost').innerHTML=0;
    
   //返回起点位置
   return {observation:agent,observation2:observer};
}
delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

step(action,agentDiv,returnValue=true){
     //根据当前位置来获得回报值,及是否终止
    // 找到当前方块的位置
    let currentIndex = Array.from(this.gridItems).findIndex(item => item.contains(agentDiv));
    let s=currentIndex;
    if(s==target0&&agentDiv==this.agent1Div) return {s,reward:null,done:true,oval_flag:true};
    let newIndex;
    switch(action){
    case 0:
        //向上移动
        newIndex=currentIndex>8?currentIndex-9:currentIndex;
        break;
    case 1:
        //向下移动
        newIndex=currentIndex<72?currentIndex+9:currentIndex;
        break;
    case 2:
        //向左移动
        newIndex=currentIndex%9!==0?currentIndex-1:currentIndex;
        break;
    case 3:
        //向右移动
        newIndex=(currentIndex+1)%9!=0?currentIndex+1:currentIndex;
        break;
    default:
        //不移动
        return;
 }

 let s_ = newIndex; // 移动后的新状态
 //移动到新位置
 this.gridItems[newIndex].appendChild(agentDiv);
 
 if(!returnValue){
    return s_;
}

let reward, done, oval_flag = false;
//立即修正
 if(agentDiv==this.agent1Div) this.oval_pos=[target0];
 else this.oval_pos=agent2Goal?target1:target0;
 
 if(s_==this.oval_pos){
    reward=0;
    done=true;
    if(agentDiv==this.agent1Div){
        s_="terminal";}
    oval_flag=true;
}
// else if(this.hell.includes(s_)){
//     reward=-0.1;
//     done=false;
//     s_="terminal";
// }
else if(!this.visited[s_]){
    this.visited[s_] = true; // 标记为已访问
    done = false;
    if(agentDiv==this.agent2Div){
        reward=-0.2
    }
    //__需立即修正____________
    else reward=-0.2
} else {
    reward = -0.2; // 重新访问非目标状态的惩罚
    done = false;
}
return {s_,reward,done,oval_flag}
} 
//根据传入策略进行界面渲染
render_by_policy(){
    console.log("成功");
    }
}
export default Maze;
