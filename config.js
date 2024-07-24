// config.js 基本参数设置 严格模式不允许隐式全局变量的创建。


//基本布局参数
window.agent=56;
window.observer = 50;
window.target0 = 4;
window.target1 = 9;

//判定Q表数组采取的列数
//0代表目标是target0:4第一列，1代表目标是target1:9第二列 agent1Goal始终是0
window.agent1Goal=0;
window.agent2Goal=0;

//调控get_policy2函数显示谁的策略
 window.showGoal=1;