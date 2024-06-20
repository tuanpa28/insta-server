export const getLastName = (fullName: string) => {
  // Chuyển chuỗi tên về dạng chuẩn, loại bỏ dấu và chuyển về chữ thường
  const normalizedFullName = fullName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  // Tách chuỗi thành các từ
  const words = normalizedFullName
    .split(' ')
    .filter((word) => word.trim() !== '');

  // Lấy từ cuối cùng trong mảng words
  const lastWord = words.length > 0 ? words[words.length - 1] : '';

  return lastWord;
};
