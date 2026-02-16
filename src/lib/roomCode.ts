export const generateRoomCode = (length: number = 6): string => {
  let result = ''
  while (result.length < length) {
    result += Math.random().toString(36).substring(2)
  }
  return result.substring(0, length).toUpperCase()
}
