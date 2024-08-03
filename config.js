// config.js 基本参数设置 
//基本布局参数
window.agent=56;
window.observer = null;
window.target0 = 4;
window.target1 = 9;

//判定Q表数组采取的列数
//0代表目标是target0:4第一列，1代表目标是target1:9第二列 agent1Goal始终是0
window.agent1Goal=0;

//agent2Goal随机 showGoal1=1乱  注意要与target进行联动(RL_brain.js)
//若在大循环中随机指定目标，则其值其实无用 但必须定义 因严格模式不允许隐式全局变量的创建。
window.agent2Goal=null;

//调控get_policy2函数显示谁的策略
window.showGoal=1;

//提前定义起点与终点的最短距离
window.dG1=8;
window.dG2=7;