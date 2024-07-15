import Maze from './Maze.js'
import { QLearningTable,ObserverRL} from './RL_brain.js';

//改g1 rewardshaping 1改 Maze oval_pos二改 s_=9三改 delete四改
let METHOD;
//拿到页面设计端元素
const gridItems = document.querySelectorAll('.grid-item');
//获得cost元素
const cost=document.getElementById('cost');
//成本初始为0
let C=0;
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
probability_g1=probability_g1/(f2+1e-60);
probability_g2=probability_g2/(f2+1e-60);
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
            if(key === 'terminal'||key==9) return; // 跳过terminal属性和无效的key
            // 获取每个动作的目标为0的Q值
            const valuesForGoal0 = row.map(actionValues => actionValues[0]);
            const maxVal = Math.max(...valuesForGoal0);
            const indices = valuesForGoal0.reduce((indices, val, index) => {
                return val === maxVal ? indices.concat(index) : indices;
            }, []);
            // 收集所有最大值对应的方向符号
            let symbolsToShow = indices.map(index => directionSymbols[index]).join('');
            // 设置收集到的符号到对应的gridItem
            gridItems[key].textContent = symbolsToShow;
            // console.log(`第${key}行最大下标分别是${indices}`);
        });  
    }
    function get_policy2(q_table) {
       
        const directionSymbols = ['⭡', '⭣', '⭠', '⭢']; // 映射表，索引对应于方向
        Object.entries(q_table).forEach(([key, row]) => {
         
            const [state1, state2] = key.split(',').map(Number); // 拆分状态，转换为数字
         
            if (key === 'terminal' || state2 == 9) return; // 跳过terminal属性和不需要处理的状态
            
            
             // 确保gridItems中存在当前key
        // if (!(key in gridItems)) {
        //     console.warn(`警告: gridItems 中不存在键 ${key}`);
        //     return;
        // }
            // 获取每个动作的第二个值的Q值
            const valuesForGoal1 = row.map(actionValues => actionValues[1]);
            const maxVal = Math.max(...valuesForGoal1);
            const indices = valuesForGoal1.reduce((indices, val, index) => {
                return val === maxVal ? indices.concat(index) : indices;
            }, []);
            
            // 收集所有最大值对应的方向符号
            let symbolsToShow = indices.map(index => directionSymbols[index]).join('');
            
            // 设置收集到的符号到对应的gridItem
            gridItems[state2].textContent = symbolsToShow;
            
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
    for(let episode=0;episode<120;episode++){
        //随机初始化一个目标
        //let goal=Math.ceil(Math.random()*2);
        let goal=0;
        if(goal==0){
            RL.q_table['terminal']=RL.q_table[4];
            delete RL.q_table[4];
        }
        else{
            RL.q_table['terminal']=RL.q_table[9];
            delete RL.q_table[9];
        }
        //初始化智能体1的装态
        let {observation,observation2}=env.reset()
        let c=0;
        let tmp_policy={}
        let observation_, reward, oval_flag; // 初始化变量
        let observation2_,reward2,oval_flag2;
        //定义智能体是否到达目标
        let done=false;
        let done2=false;
        let agent2ToGoal=false;

        while(true){
            let action,action2;
            if(!done){
            //基于当前状态S选择行为A
            action=RL.chooseAction(observation);
            console.log(action);
  
            ({s_:observation_,reward,done,oval_flag}=env.step(action,env.agent1Div));
            //console.log("选择的行为"+action);
            let state_item=observation
            tmp_policy[state_item]=action
            if(observation_!=state_item){
                step(observation_);
                if(isNaN(probability_g1)){
                    console.log("dc");
                    console.log("e是"+episode);
                    console.log("c是738"+c);
                    }
                }
                    //原0.18
                reward=reward+probability_g1*0.2;
                RL.learn(observation,action,reward,observation_,goal)
                //改变状态和行为
                //console.log("重塑后的奖励"+reward)
            
        }
        if(!done2){
        action2=RL2.chooseAction(`${observation},${observation2}`);
            //采取行为获得下一个状态和回报，以及是否终止
            ({s_:observation2_,reward:reward2,done:done2,oval_flag:oval_flag2}=env.step(action2,env.agent2Div));
            //await delay(100);  // 延时50毫秒    
                //根据当前变化更新Q
                if(done){ observation=observation_=goal?9:4; }
                RL2.learn(`${observation},${observation2}`,action2,reward2, `${observation_},${observation2_}`,!goal)
        }

        //改变状态和行为
        observation=observation_; 
        observation2=observation2_; 

            c+=1;
            //RL.updateEpsilon(episode);
            //如果为终止状态，结束当前的局数
        
            if(done&&done2) {
                 C=0; 
                 break;
             }
        }
    }
    console.log(RL2.q_table);
    //get_policy(RL.q_table)
    //env.reset();
    console.log("240局游戏结束");
    //输出最终Q表
    let q_table_result=RL.q_table;
    //绘制相关箭头
    //console.log(q_table_result); // 打印出q_table看看是什么
    //get_policy(q_table_result);
    //test(q_table_result);
    //policy?console.log("最优策略已收敛:",policy):console.log("最优策略未收敛");
    //console.table(q_table_result);
}
//收完整值
//定义nengdan函数，调用时，接受(状态两个状态，返回第二个智能体所能做的最优动作)
function nengdan(observation,q_table){
    // let total_rewards=0;
    // let action;
    // let actions=[];
    // for(let i=0;i<1;i++){
    //     observation=observation2;
    //     let isDone=false;
            //const childDiv = document.createElement('div');
            //childDiv.className = 'line'; // 给新的子元素添加类名 'q'
            observation=observation.split(',')[0]=='terminal'?'4,'+observation.split(',')[1]:observation;
                const stateActionValues =q_table[observation].map(actionValues => actionValues[0]);
                // 找出最大值
                const maxValue = Math.max(...stateActionValues);
                // 找出所有最大值的索引
                const maxIndexes = stateActionValues.reduce((indexes, currentValue, currentIndex) => {
                    if (currentValue === maxValue) {
                        indexes.push(currentIndex);
                    }
                    return indexes;
                }, []);
            // 从最大值索引中随机选择一个 
            const randomIndex = maxIndexes[Math.floor(Math.random() * maxIndexes.length)];
            return randomIndex;
        

        // if(action==0){
        //     childDiv.style.top = '-54.5%';
        //     childDiv.style.bottom='47.5%';
        //     childDiv.style['border-left']="3px solid black";
        //     // childDiv.style.left='50%';
        //     gridItems[observation].appendChild(childDiv);
        // }
        // if(action==1){
        //     childDiv.style.top = '47.5%';
        //     childDiv.style.bottom='-54.5%';
        //     childDiv.style['border-left']="3px solid black";
        //     // childDiv.style.left='50%';
        //     gridItems[observation].appendChild(childDiv);
        // }
        // if(action==2){
        //     childDiv.style.left = '-54.5%';
        //     childDiv.style.right='47.5%';
        //     childDiv.style['border-top']="3px solid black";
        //     // childDiv.style.left='50%';
        //     gridItems[observation].appendChild(childDiv);
        // }
        // if(action==3){
        //     childDiv.style.left = '47.5%';
        //     childDiv.style.right='-54.5%';
        //     childDiv.style['border-top']="3px solid black";
        //     // childDiv.style.left='50%';
        //     gridItems[observation].appendChild(childDiv);
        // }
        //env.step(action) 其中step会产生动画效果
        let {s_:observation_,reward,done,oval_flag}=env.step(action,env.agent1Div);

        let {s_:observation2_,reward:reward2,done:done2,oval_flag2}=env.step(action,env.agent2Div)

        actions.push(action)
        //let observation_=env.step(action,env.agent1Div,false);
        isDone=done;
        //isDone=observation_==4?true:false;
        //total_rewards+=reward;
        observation=observation_;

        observation2=observation2_;

        //await delay(200)
        
        if(isDone) {
            console.log(actions);
            //continue;
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


async function test(q_table,agentDiv){
    alert("hahaha")
    let total_rewards=0;
    let action;
    let action2s=[];
    let actions=[];
    for(let i=0;i<1;i++){
        let {observation,observation2}=env.reset();
        let isDone=false;
        while(!isDone){
            const childDiv = document.createElement('div');
            childDiv.className = 'line'; // 给新的子元素添加类名 'q'
            if(agentDiv==env.agent1Div){
                const stateActionValues = q_table[observation].map(actionValues => actionValues[0]);
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
        }
        // if(action==0){
        //     childDiv.style.top = '-54.5%';
        //     childDiv.style.bottom='47.5%';
        //     childDiv.style['border-left']="3px solid black";
        //     // childDiv.style.left='50%';
        //     gridItems[observation].appendChild(childDiv);
        // }
        // if(action==1){
        //     childDiv.style.top = '47.5%';
        //     childDiv.style.bottom='-54.5%';
        //     childDiv.style['border-left']="3px solid black";
        //     // childDiv.style.left='50%';
        //     gridItems[observation].appendChild(childDiv);
        // }
        // if(action==2){
        //     childDiv.style.left = '-54.5%';
        //     childDiv.style.right='47.5%';
        //     childDiv.style['border-top']="3px solid black";
        //     // childDiv.style.left='50%';
        //     gridItems[observation].appendChild(childDiv);
        // }
        // if(action==3){
        //     childDiv.style.left = '47.5%';
        //     childDiv.style.right='-54.5%';
        //     childDiv.style['border-top']="3px solid black";
        //     // childDiv.style.left='50%';
        //     gridItems[observation].appendChild(childDiv);
        // }
        //env.step(action) 其中step会产生动画效果
        let {s_:observation_,reward,done,oval_flag}=env.step(action,env.agent1Div);

        action2s.push(nengdan(`${observation},${observation2}`,RL2.q_table))
        let {s_:observation2_,reward:reward2,done:done2,oval_flag2}=env.step(action,env.agent2Div)

        actions.push(action)
        //let observation_=env.step(action,env.agent1Div,false);
        isDone=done;
        //isDone=observation_==4?true:false;
        //total_rewards+=reward;
        observation=observation_;
        observation2=observation2_;
        //await delay(200)
        }
        if(isDone) {
            console.log(actions);
            console.log(action2s);
            continue;}
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

function main() {
    window.env = new Maze(); // 假设Maze是一个有效的类
    window.env2=new Maze();
    // 根据所选择的方法初始化RL实例
    if(METHOD==='SARSA'){
        window.RL=new SarsaTable(env.action_space);
    }
    else if(METHOD==='Q-Learning'){
        window.RL=new QLearningTable(env.action_space);
        window.RL2=new ObserverRL(env.action_space)
    }
    // 启动更新过程
    update();
}

// 确保DOM完全加载后再运行主函数
document.addEventListener('DOMContentLoaded', function() {
    // 选择按钮
    const qlearningButton = document.querySelector('.qlearning');    
    const stepButton=document.querySelector('.step')
    const testButton=document.querySelector('.test')
    // 为Q-Learning按钮添加点击事件监听器
    qlearningButton.addEventListener('click', function() {
        METHOD = "Q-Learning";
        main(); // 调用main函数启动Q-Learning
    });
    stepButton.addEventListener('click',function(){
        //console.log("lallalallla");
        //step(RL.q_table);
        get_policy2(RL2.q_table)
    })
    testButton.addEventListener('click',function(){
        test(RL.q_table,env.agent1Div);
        //test(RL2.q_table,env.agent2Div);
    })
});