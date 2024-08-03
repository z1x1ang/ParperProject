function findAllPathsDFS(grid, start, end) {
    let paths = [];
    let path = [];
    let found=false;
    dfs(start,path);
    return paths;

    function dfs(start, path) {
        //console.log(start);
        let [x,y]=start;
        console.log(grid);
        if (x < 0 || x >= grid.length || y < 0 || y >= grid[0].length || grid[x][y] === 1) {
            return; // 超出边界或遇到障碍
        } 
        path.push([x, y]); // 添加当前节点到路径中  
        if (x === end[0] && y === end[1]) {
            paths.push([...path]); // 找到一条路径，保存它的副本
            found=true;
        } else {
            grid[x][y] = 1; // 标记为已访问
            // 探索四个方向
            if(!found)  dfs([x + 1, y], path);
            if(!found)  dfs([x - 1, y], path);
            if(!found)  dfs([x, y + 1], path);
            if(!found)  dfs([x, y - 1], path);
            grid[x][y] = 0; // 回溯，撤销标记
        }

        if (!found) path.pop(); // 回溯，移除当前节点
    }
}

const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
console.table(grid);
document.querySelectorAll('.grid-item').forEach(item=>{
   const row = parseInt(item.dataset.row, 10);
   const col = parseInt(item.dataset.col, 10);
//    if(item.querySelector('.w')){
//     grid[row][col]='w';
//    }else if(item.querySelector('.q-hero')){
//     grid[row][col]='q-hero';
//    }
});

 const start = [6, 2];
 const end = [0, 4];

 console.log(findAllPathsDFS(grid, start, end));
