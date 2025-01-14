export const getChatRoomIdFromLocalStorage = () => {
    const savedId = localStorage.getItem('chatRoomId');
    return savedId ? JSON.parse(savedId) : null;
};

export const setChatRoomIdToLocalStorage = (id: number) => {
    if (id !== null) {
        localStorage.setItem('chatRoomId', JSON.stringify(id));
    }
};
