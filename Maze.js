/*初始化 Q 表为所有状态和动作的随机值，范围在 [0, 2]
对于每一次训练会话：
    初始化状态 s
    重复以下步骤直到会话结束：
        以 ε-贪婪策略选择动作 a：
            以概率 0.1 随机选择一个动作
            以概率 0.9 选择使 Q(s, a) 最大化的动作
        执行动作 a，观察奖励 r 和新状态 s'
        如果 s' 是之前访问过的状态：
            计算循环惩罚： r' = r - 0.2  (添加额外的惩罚以阻止循环行为)
        否则：
            r' = r
        更新 Q 值：
            Q(s, a) ← Q(s, a) + 0.9 * (r' + 0.9 * max(Q(s', a')) - Q(s, a))
        s ← s'
*/
class Maze{
constructor(){
//初始化主角位置
this.gridItems=document.getElementsByClassName('grid-item');
this.newDiv = document.querySelector('.q-hero');
//初始化动作空间 0上 1下 2左 3右
this.action_space=[0,1,2,3]
//初始化陷阱位置
this.hell=[9];
//初始化宝藏位置
this.oval_pos=[4];
// 初始化状态访问记录
this.visited = new Array(this.gridItems.length).fill(false);
}
reset(){
   this.gridItems[56].appendChild(this.newDiv);
   //重置visited数组全为0
   this.visited.fill(false);
   //返回起点位置
   return 56;
}
delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

step(action,returnValue=true){
    // 找到当前方块的位置
    let currentIndex = Array.from(this.gridItems).findIndex(item => item.contains(this.newDiv));
    let s=currentIndex;
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


 //移动到新位置
 this.gridItems[newIndex].appendChild(this.newDiv);
 let s_ = newIndex; // 移动后的新状态
 if(!returnValue){
    return s_;
}

 //根据当前位置来获得回报值,及是否终止
 let reward, done, oval_flag = false;
 if(s_==this.oval_pos){
    reward=0;
    done=true;
    s_="terminal";
    oval_flag=true;
}

// else if(this.hell.includes(s_)){
//     reward=-0.1;
//     done=false;
//     s_="terminal";
// }
else if(!this.visited[s_]){
    reward = -0.1; // 首次访问非目标状态的惩罚
    this.visited[s_] = true; // 标记为已访问
    done = false;
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
