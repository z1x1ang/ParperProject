class RL{
    constructor(actions,learning_rate=0.9,reward_decay=0.9,e_greedy=0.9){
        this.actions=actions;
        this.lr=learning_rate;
        this.gamma=reward_decay;
        this.epsilon=e_greedy;
        this.q_table={};//Q表用对象表示
        for (let state = 0; state <= 80; state++) {
            this.q_table[state] = Array.from({length: this.actions.length}, () => [0,0]);
        }
        // 在循环外更改状态4的键为'terminal'
        this.q_table['terminal'] //= this.q_table[4];
        //delete this.q_table[4];
        this.i=0;
        //设置随机种子
        this.random=new Math.seedrandom('2024');
    }
    //observation 某个状态state，0,1,2,3
    chooseAction(observation) {
        if(observation=="terminal") return;
        //this.checkStateExist(observation); // 确保状态存在
        //从均匀分布的[0,1)中随机采样,当小于阈值时采用选择最优行为的方式,当大于阈值选择随机行为的方式
        //return this.actionArray[this.i++]
        if (this.random() < this.epsilon) {
            // ε-greedy 策略选择动作
            try{
            const stateActionValues = this.q_table[observation].map(actionValues => actionValues[0]);
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
        const randomIndex = maxIndexes[Math.floor(this.random() * maxIndexes.length)];
        return this.actions[randomIndex]; // 根据最大价值随机选择动作
    }
    catch(error){
        throw new Error("An error occurred: " + observation);
    }
     } else {
            // 随机选择动作
            const randomIndex = Math.floor(this.random() * this.actions.length);
            return this.actions[randomIndex];
        }
    }
    //线性递减
    // updateEpsilon(currentEpisode) {
    //     //线性递减epsilon
    //     const initialEpsilon = this.epsilon; // 初始epsilon值0.9
    //     const minEpsilon = 0.01; // epsilon的最小值
    //     const decayRate = (initialEpsilon - minEpsilon) / 100; // 计算递减率
    //     this.epsilon = Math.max(0.1, initialEpsilon - decayRate * currentEpisode); // 更新epsilon值，确保不小于最小值
    // }    
}


class QLearningTable extends RL{
    constructor(actions,learning_rate,reward_decay,e_greedy){
        super(actions,learning_rate,reward_decay,e_greedy)
    }
    learn(s,a,r,s_,goal){
        if(s=='terminal') return;
        const qPredict=this.q_table[s][this.actions.indexOf(a)][goal];
        const qTarget=s_!=='terminal'?
            r + this.gamma * Math.max(...Object.values(this.q_table[s_].map(actionValues => actionValues[goal]))) :
            r;
        this.q_table[s][this.actions.indexOf(a)][goal]+=this.lr*(qTarget-qPredict)
        //console.log(s+','+a+','+this.q_table[s][this.actions.indexOf(a)]);
    }
}
class ObserverRL extends RL {
    constructor(actions, learning_rate = 0.9, reward_decay = 0.9, e_greedy = 0.9) {
        super(actions, learning_rate, reward_decay, e_greedy);
        // 初始化一个不同形状的Q表
        this.q_table = {};
        for(let state1=0;state1<=80;state1++){
            for(let state2=0;state2<=80;state2++){
                const key=`${state1},${state2}`;
                this.q_table[key]=Array.from({length:4},()=>[0,0]);
            }
        }
    }

    chooseAction(observation) {
        //this.checkStateExist(observation); // 确保状态存在
        //从均匀分布的[0,1)中随机采样,当小于阈值时采用选择最优行为的方式,当大于阈值选择随机行为的方式
        //return this.actionArray[this.i++]
        observation=observation.split(',')[0]=='terminal'?'4,'+observation.split(',')[1]:observation;
        if (this.random() < this.epsilon) {
            // ε-greedy 策略选择动作
            try{
            const stateActionValues = this.q_table[observation].map(actionValues => actionValues[0]);
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
        const randomIndex = maxIndexes[Math.floor(this.random() * maxIndexes.length)];
        return this.actions[randomIndex]; // 根据最大价值随机选择动作
    }
    catch(error){
        throw new Error("An error occurred: " + observation);
         }
        } else {
            // 随机选择动作
            const randomIndex = Math.floor(this.random() * this.actions.length);
            return this.actions[randomIndex];
        }
    }

    learn(s,a,r,s_,goal){
        goal=goal?1:0;
        const qPredict=this.q_table[s][this.actions.indexOf(a)][goal];
        //9号目标
        const qTarget=s_.split(',')[1]!=='9'?
            r + this.gamma * Math.max(...Object.values(this.q_table[s_].map(actionValues => actionValues[goal]))) :
            r;
        this.q_table[s][this.actions.indexOf(a)][goal]+=this.lr*(qTarget-qPredict)
        //console.log(s+','+a+','+this.q_table[s][this.actions.indexOf(a)]);
    }
}
export { ObserverRL };
export {QLearningTable};
