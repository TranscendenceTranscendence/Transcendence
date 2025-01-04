import axios from 'axios';

export const deleteItem = async (chatRoomId, id) => {
  try {
    await axios.delete(`https://localhost:3000/chatParticipants/${chatRoomId}/delete/${id}`);
    console.log('Item deleted successfully');
  } catch (error) {
    console.error('Error deleting item:', error);
  }
};