const { v4: uuid } = require('uuid');

const wb = socket => {
  // 加入房间，房间号为空则分配新房间
  socket.on('joinRoom', room => {
    if (room === null) {
      const id = uuid();
      socket.join(id);
      // 分配新房间
      socket.emit('giveRoom', id);
      return false;
    }
    socket.join(room);
  });
  // 当前画笔路径
  socket.on('brushPath', path => {
    socket.broadcast.to([...socket.rooms][1]).emit('brushPath', path);
  });
  // 历史栈画笔路径
  socket.on('brushHistory', path => {
    socket.broadcast.to([...socket.rooms][1]).emit('brushHistory', path);
  });
  // 历史栈画笔路径删除
  socket.on('deleteBrushHistory', index => {
    socket.broadcast.to([...socket.rooms][1]).emit('deleteBrushHistory', index);
  });
  // 断开连接
  socket.on('disconnect', () => {
    console.log('disconnect');
  });
};

module.exports = wb;
