import Maze from './Maze.js'

//拿到页面设计端元素
const gridItems = document.querySelectorAll('.grid-item');
//获得cost元素
const cost=document.getElementById('cost');
//成本初始为0
let C=0;
//定义去每个目标的概率
let probability_g1,probability_g2;
//假设按这个路径走
//let indices=[3,3,3,3,0,0,0,0,0,0,2,2];
let indices;
//定义总的时间步长
let T;
let legiable_f1;
let legiable_f2;
//定义初始可读性
let legibility;
//定义初始动作下标
let i=0;

//数值向坐标转换
function getCoordinates(n) {
    return [Math.floor(n / 9), n % 9];
}

//接收的是状态序列
function checkAction(states){
    let actions = [];
    for (let i = 0; i < states.length - 1; i++) {
        let current = states[i];
        let next = states[i + 1];
        if (next[0] === current[0] && next[1] === current[1] - 1) {
            actions.push(2); // 左
        } else if (next[0] === current[0] && next[1] === current[1] + 1) {
            actions.push(3); // 右
        } else if (next[0] === current[0] - 1 && next[1] === current[1]) {
            actions.push(0); // 上
        } else if (next[0] === current[0] + 1 && next[1] === current[1]) {
            actions.push(1); // 下
        }
    }
    indices=actions;
    //定义初始变量
    T=actions.length;
    legiable_f1=0.5*T;
    legiable_f2=T;
    legibility=legiable_f1/legiable_f2;
    i=0;
    return actions;
}

function updateProbability(cost,minCost,minCost2){ 
    let f2=Math.exp(-cost-minCost)*0.5/Math.exp(-8)+Math.exp(-cost-minCost2)*0.5/Math.exp(-7);
    //计算去每个目标的概率
    probability_g1=Math.exp(-cost-minCost)*0.5/Math.exp(-8);
    probability_g2=Math.exp(-cost-minCost2)*0.5/Math.exp(-7);
    //归一化 
    probability_g1=probability_g1/f2;
    probability_g2=probability_g2/f2;
    //更新GUI
    document.getElementById("pg1").innerText=probability_g1;
    document.getElementById("pg2").innerText=probability_g2;
    //计算可读性 分子
    legiable_f1+=probability_g1*(T-cost);
    //计算可读性分母
    legiable_f2+=T-cost;
    //36等于总的时间步长12+11+8+7+...+1=78
    legibility=legiable_f1/legiable_f2;
    //更新GUI
    document.getElementById("legibleValue").innerText=legibility;
    }

    function step(){
        //每步更新成本，C被初始化为0
        cost.textContent=++C;
        //算最优动作
        //let currentIndex = Array.from(env.gridItems).findIndex(item => item.contains(env.agent1Div));
        //移动，更新GUI
        let s_=env.step(indices[i++],env.agent1Div,false);
        //console.log(getCoordinates(s_));
        document.getElementById('cost*').textContent=getCoordinates(s_)[0]+Math.abs(getCoordinates(s_)[1]-4);
        document.getElementById('cost2*').textContent=Math.abs(getCoordinates(s_)[0]-1)+getCoordinates(s_)[1];
        updateProbability(cost.textContent,getCoordinates(s_)[0]+Math.abs(getCoordinates(s_)[1]-4),Math.abs(getCoordinates(s_)[0]-1)+getCoordinates(s_)[1])
    }


// 蒙特卡洛随机生成几条路径 --种群 
function findMonteCarloPaths(grid, start, end, maxPaths, maxLength) {
    let paths = [];
    let attempts = 0;
    let maxAttempts = 1000;  // 最大尝试次数，以防止无限循环

    while (paths.length < maxPaths && attempts < maxAttempts) {
        let path = generateRandomPath(grid, start, end, maxLength);
        if (path && path.length <= maxLength) {
            paths.push(path);
        }
        attempts++;
    }
    return paths;

    function generateRandomPath(grid, start, end, maxLength) {
        let path = [];
        let visited = new Set();  // 用于跟踪访问过的状态
        let [x, y] = start;
        path.push([x, y]);
        visited.add(`${x},${y}`);  // 将起始位置添加到访问过的状态集
        while (path.length < maxLength && !(x === end[0] && y === end[1])) {
            let directions = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
            directions = directions.filter(dir => isValidMove(grid, dir[0], dir[1], visited));
            if (directions.length === 0) break; // 无路可走
            let nextMove = directions[Math.floor(Math.random() * directions.length)];
            x = nextMove[0]; 
            y = nextMove[1];
            path.push([x, y]);
            visited.add(`${x},${y}`);  // 记录新访问的状态
        }
        if (x === end[0] && y === end[1]) {
            return path;
        }
        return null;
    }
    function isValidMove(grid, x, y, visited) {
        // 确保移动的位置在网格范围内，不是障碍物，且未被访问过
        return !(x < 0 || x >= grid.length || y < 0 || y >= grid[0].length || grid[x][y] === 1 || visited.has(`${x},${y}`));
    }
}


const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
console.log(grid);
const start = [6, 2];
const end = [0, 4];

//基于被选择概率从种群中选择个体
function selectIndividualsBasedOnProbability(selectionProbabilities,population){
    //被选择的个体
    let selectedIndividuals=[];
    //计算每个个体的累积概率
    let cumulativeProbabilities=[];
    let cumulativeSum=0;
    for(let probability of selectionProbabilities){
        cumulativeSum+=probability;
        cumulativeProbabilities.push(cumulativeSum);
    }
    //console.log(cumulativeProbabilities);
//选择
for(let i=0;i<population.length;i++){
    //生成一个0到1的随机数
    let rand=Math.random();
    //找到第一个累计概率大于随机数的个体，好的个体可能被多次选择
    for(let index=0;index<cumulativeProbabilities.length;index++){
        if(rand<cumulativeProbabilities[index]){
            selectedIndividuals.push(population[index]);
            break;
        }
     }
  }
  return selectedIndividuals;
}

//Calculate Fitness 计算适应度函数
function calculate_fitness(individual){ 
    //转成动作序列
    checkAction(individual);
    //重置某些变量
    C=0;
    env.reset();
    document.getElementById('legibleValue').innerHTML=legibility;
    for(let i=0;i<T;i++){   
        step(); 
    }
    return legibility;
}
//检查突变后的路径是否包含重复的节点
function containsDuplicates(path) {
    let seen = new Set();
    for (let node of path) {
        let key = `${node[0]},${node[1]}`;
        if (seen.has(key)) {
            return true; // 发现重复
        }
        seen.add(key);
    }
    return false;
}

//Selection Operation 选择算子(轮盘赌) 
function  roulette_wheel_selection(population, fitnesses){
    //total_fitness=total_legibility
    let total_fitness=fitnesses.reduce((acc,val)=>acc+val,0);
    console.log(total_fitness);
    let selection_probabilities=fitnesses.map(fitness=>fitness/total_fitness);
    let selected_individuals=selectIndividualsBasedOnProbability(selection_probabilities,population)
    return selected_individuals;
}

//Crossover Operation: 单点交叉(为保证生成路径的有效性采用公共点作为交叉点的方法)
function single_point_crossover(parent1, parent2) {

    // 确定共有的栅格点（交叉点），除去起点和终点
    let commonPoints = parent1.slice(1, -1).filter(coord1 =>
        parent2.some(coord2 => coord2[0] === coord1[0] && coord2[1] === coord1[1])
    );

    // 如果没有共有栅格点或只有一个，直接返回父代（避免生成无效子代）
    if (commonPoints.length < 1) {
        return [parent1, parent2];
    }

    // 随机选择一个共有的栅格点作为交叉点
    const crossoverPoint = commonPoints[Math.floor(Math.random() * commonPoints.length)];

    // 找到交叉点在父代中的索引
    const index1 = parent1.findIndex(coord => coord[0] === crossoverPoint[0] && coord[1] === crossoverPoint[1]);
    const index2 = parent2.findIndex(coord => coord[0] === crossoverPoint[0] && coord[1] === crossoverPoint[1]);

    // 生成后代：在共有栅格点进行交叉
    const offspring1 = parent1.slice(0, index1 + 1).concat(parent2.slice(index2 + 1));
    const offspring2 = parent2.slice(0, index2 + 1).concat(parent1.slice(index1 + 1));

    console.log("===============");
    console.log(parent1);
    console.log(parent2);
    console.log(offspring1);
    console.log(offspring2);
    console.log("===============");

    return [offspring1, offspring2];
}

//Mutation Operation 变异操作:差分进化 (突变算子)
function mutate(offspring, mutation_rate) {
    return offspring.map(individual => {
        const pathLength = individual.length;
        const mutationLength = Math.floor(pathLength * mutation_rate);
        const startIndex = Math.floor(Math.random() * (pathLength - mutationLength));
        const endIndex = startIndex + mutationLength;

        const start = individual[startIndex];
        const end = individual[Math.min(endIndex, pathLength - 1)];

        const mutationSegment = findMonteCarloPaths(grid, start, end, 1, mutationLength * 4);

        let newPath = [
            ...individual.slice(0, startIndex),
            ...mutationSegment[0],
            ...individual.slice(endIndex + 1)
        ];

        // 检查新路径中是否有重复节点
        if (containsDuplicates(newPath)) {
            return individual; // 如果有重复，返回原始路径
        }

        return newPath;
    });
}

// 确保DOM完全加载后再运行主函数
document.addEventListener('DOMContentLoaded', function() {
    // 选择按钮
    const qlearningButton = document.querySelector('.qlearning');    
    const stepButton=document.querySelector('.step')
    window.env = new Maze(); 

    //Initial Population 每个states里的路径是一个个体 10个个体 每个路径最长为30步
    let population=findMonteCarloPaths(grid, start, end, 10, 30);
    //indices=checkAction(states);  // 输出对应的动作集合
    //迭代
    while(true){
        //计算种群里每个个体的适应度
        const fitnesses = population.map(individual => calculate_fitness(individual));
        console.log(fitnesses);
        //使用轮盘赌从旧种群里筛选"父母"
        population = roulette_wheel_selection(population, fitnesses);
        console.log("筛选后的种群");
        console.log(population);
        let new_population = [];
        //一次处理两个个体
        for(let i=0;i<population.length;i+=2){
           let offspring = single_point_crossover(population[i], population[i+1]);
           console.log(offspring);
           offspring=mutate(offspring,0.2);
           //offspring是两个数组平和而成的大数组
           new_population.push(offspring);
        }
        population=new_population;
        break;
    }
    //计算0号个体的适应度
    //calculate_fitness(states)





    // 为Q-Learning按钮添加点击事件监听器
    qlearningButton.addEventListener('click', function() {
        METHOD = "Q-Learning";
        main(); // 调用main函数启动Q-Learning
    });
    stepButton.addEventListener('click',function(){
        console.log("lallalallla");
        step();
    })
});
//paper:https://f.ws28.cn/f/ervg0e13g3c 复制链接到浏览器打开