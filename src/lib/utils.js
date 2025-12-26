// 简单的本地 ID 生成器，用于演示（如果数据库未连接）
export const generateRoomId = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};
