import Maze from './Maze.js'
import { QLearningTable } from './RL_brain.js';

let METHOD;
//拿到页面设计端元素
const gridItems = document.querySelectorAll('.grid-item');
//获得cost元素
const cost=document.getElementById('cost');

//成本初始为0
let C=0


//定义去每个目标的概率
let probability_g1,probability_g2;


//定义初始动作下标
let i=0;

async function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
//数值向坐标转换
function getCoordinates(n) {
        return [Math.floor(n / 9), n % 9];
}

//softmax规范化，将数值转换成概率
//cost智能体的行动成本 minCost到真实目标g1的最优成本，minCost到真实目标g2的最优成本
function updateProbability(cost,minCost,minCost2){ 
let f2=Math.exp(-cost-minCost)*0.5/Math.exp(-8)+Math.exp(-cost-minCost2)*0.5/Math.exp(-7);
//计算去每个目标的概率
probability_g1=Math.exp(-cost-minCost)*0.5/Math.exp(-8);
probability_g2=Math.exp(-cost-minCost2)*0.5/Math.exp(-7);
//console.log(probability_g1);
//console.log(probability_g2);
//归一化 1e-18
probability_g1=probability_g1/(f2);
probability_g2=probability_g2/(f2);
//更新GUI
document.getElementById("pg1").innerText=probability_g1;
document.getElementById("pg2").innerText=probability_g2;

//计算可读性 分子
//legiable_f1+=probability_g1*(T-cost);
//计算可读性分母
//legiable_f2+=T-cost;
//36等于总的时间步长12+11+8+7+...+1=78
//console.log("lll"+legiable_f1);
//legibility=legiable_f1/legiable_f2;
//更新GUI
//document.getElementById("legibleValue").innerText=legibility;
//console.log(legiable_f1/legiable_f2);
}

    function get_policy(q_table) {
      
        const directionSymbols = ['⭡', '⭣', '⭠', '⭢']; // 映射表，索引对应于方向
    
        Object.entries(q_table).forEach(([key, row]) => {
            if (key === 'terminal'||key==9) return; // 跳过terminal属性和无效的key
            const maxVal = Math.max(...row);
            const indices = row.reduce((indices, val, index) => {
                return val === maxVal ? indices.concat(index) : indices;
            }, []);
            // 收集所有最大值对应的方向符号
            let symbolsToShow = indices.map(index => directionSymbols[index]).join('');
            // 设置收集到的符号到对应的gridItem
            gridItems[key].textContent = symbolsToShow;
            // console.log(`第${key}行最大下标分别是${indices}`);
        });  
    }
    
function step(s_){
    //每步更新成本，C被初始化为0
    cost.textContent=++C;
    //算最优动作
    //let currentIndex = Array.from(env.gridItems).findIndex(item => item.contains(env.newDiv));
    //let max=Math.max(...q_table[currentIndex]);

    // q_table[currentIndex].forEach((value,index)=>{
    //     if(max==value){indices.push(index);}
    // })
    // let rad=Math.floor(Math.random()*indices.length);
    //移动，更新GUI
    
    //console.log(getCoordinates(s_));
    if(s_=='terminal'){
        s_=4
        //console.log("long"+typeof(s_));
    }
    else s_=parseInt(s_)
    document.getElementById('cost*').textContent=getCoordinates(s_)[0]+Math.abs(getCoordinates(s_)[1]-4);
    document.getElementById('cost2*').textContent=Math.abs(getCoordinates(s_)[0]-1)+getCoordinates(s_)[1];
    updateProbability(cost.textContent,getCoordinates(s_)[0]+Math.abs(getCoordinates(s_)[1]-4),Math.abs(getCoordinates(s_)[0]-1)+getCoordinates(s_)[1])
}
async function update(){
    console.table(RL.q_table);
    for(let episode=0;episode<120;episode++){
        //初始化装态
        let observation=env.reset()
        let c=0;
        let tmp_policy={}
        while(true){
            //基于当前状态S选择行为A
            let action=RL.chooseAction(observation)
            console.log("选择的行为"+action);
            let state_item=observation
            console.log("当前的状态"+state_item);
            tmp_policy[state_item]=action
            //采取行为获得下一个状态和回报，以及是否终止
            let {s_:observation_,reward,done,oval_flag}=env.step(action)
            console.log("获得的奖励"+reward);
            if(observation_!=state_item){
            step(observation_);
            if(isNaN(probability_g1)){
                console.log("dc");
                console.log("e是"+episode);
                console.log("c是738"+c);
                }
            reward=reward+probability_g1*0.28;
            console.log("重塑后的奖励"+reward)
        }
            await delay(50);  // 延时50毫秒    
            if(METHOD=="SARSA"){
                //基于下一个状态选择行为
                let action_=RL.chooseAction(observation_)
                //基于变化(s,a,r,s',a')使用Sarsa进行Q更新
                RL.learn(observation,action,reward,observation_,action_)
            }
            else if(METHOD=="Q-Learning"){
                //根据当前变化更新Q
                RL.learn(observation,action,reward,observation_)
            }
            //改变状态和行为
            observation=observation_;
            c+=1;
       
            //RL.updateEpsilon(episode);
            //如果为终止状态，结束当前的局数
            if(done) {
                C=0;
                break;
            }
        }
     break;
    }
    env.reset();
    console.log("120局游戏结束");
   
    //输出最终Q表
    let q_table_result=RL.q_table;
    //绘制相关箭头
    //console.log(q_table_result); // 打印出q_table看看是什么
    get_policy(q_table_result);
    //test(q_table_result);
    //policy?console.log("最优策略已收敛:",policy):console.log("最优策略未收敛");
    //console.table(q_table_result);
}

function test(q_table){
    let total_rewards=0;
    let action;
    for(let i=0;i<1;i++){
        let observation=env.reset();
        let isDone=false;
        while(!isDone){
            const childDiv = document.createElement('div');
            childDiv.className = 'line'; // 给新的子元素添加类名 'q'
            if(Math.random()<RL.epsilon){
             // ε-greedy 策略选择动作
            const stateActionValues = q_table[observation];
            //打印observation
            //console.log(observation);
            // 找出最大值
            const maxValue = Math.max(...stateActionValues);
            // 找出所有最大值的索引
            const maxIndexes = stateActionValues.reduce((indexes, currentValue, currentIndex) => {
                if (currentValue === maxValue) {
                    indexes.push(currentIndex);
                }
                return indexes;
            }, []);
        //从最大值索引中随机选择一个
        const randomIndex = maxIndexes[Math.floor(Math.random() * maxIndexes.length)];
        action=randomIndex;
        } else {
            // 随机选择动作
            const randomIndex = Math.floor(Math.random() * RL.actions.length);
            action=randomIndex;
        }
        if(action==0){
            childDiv.style.top = '-54.5%';
            childDiv.style.bottom='47.5%';
            childDiv.style['border-left']="3px solid black";
            // childDiv.style.left='50%';
            gridItems[observation].appendChild(childDiv);
        }
        if(action==1){
            childDiv.style.top = '47.5%';
            childDiv.style.bottom='-54.5%';
            childDiv.style['border-left']="3px solid black";
            // childDiv.style.left='50%';
            gridItems[observation].appendChild(childDiv);
        }
        if(action==2){
            childDiv.style.left = '-54.5%';
            childDiv.style.right='47.5%';
            childDiv.style['border-top']="3px solid black";
            // childDiv.style.left='50%';
            gridItems[observation].appendChild(childDiv);
        }
        if(action==3){
            childDiv.style.left = '47.5%';
            childDiv.style.right='-54.5%';
            childDiv.style['border-top']="3px solid black";
            // childDiv.style.left='50%';
            gridItems[observation].appendChild(childDiv);
        }
        //env.step(action) 其中step会产生动画效果
        let {s_:observation_,reward,done,oval_flag}=env.step(action);
        isDone=done;
        total_rewards+=reward;
        observation=observation_;
        }
        if(isDone) continue;
    }

// 遍历每一个grid-item
gridItems.forEach(gridItem => {
    // 获取grid-item内的所有子元素
    const children = Array.from(gridItem.childNodes);

    // 遍历所有子元素
    children.forEach(child => {
        // 检查子元素是否具有需要保留的类
        if (!child.classList || (!child.classList.contains('q') && !child.classList.contains('w') && !child.classList.contains('q-hero')&&!child.classList.contains('line'))) {
            // 如果子元素不包含指定的类，则删除
            gridItem.removeChild(child);
        }
    });
});
    let average_reward=total_rewards/100;
    console.log("平均奖励"+average_reward);
    env.reset();
}

function calculator(){
    
}
function main() {
    window.env = new Maze(); // 假设Maze是一个有效的类
    // 根据所选择的方法初始化RL实例
    if(METHOD==='SARSA'){
        window.RL=new SarsaTable(env.action_space);
    }
    else if(METHOD==='Q-Learning'){
        window.RL=new QLearningTable(env.action_space);
    }
    // 启动更新过程
    update();
}

// 确保DOM完全加载后再运行主函数
document.addEventListener('DOMContentLoaded', function() {
    // 选择按钮
    const qlearningButton = document.querySelector('.qlearning');    
    const stepButton=document.querySelector('.step')

    // 为Q-Learning按钮添加点击事件监听器
    qlearningButton.addEventListener('click', function() {
        METHOD = "Q-Learning";
        main(); // 调用main函数启动Q-Learning
    });
    stepButton.addEventListener('click',function(){
        console.log("lallalallla");
        step(RL.q_table);
    })
});