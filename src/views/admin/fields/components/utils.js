export function getFieldAuth(operating) {
  const binaryStr = operating.toString(2).padStart(8, '0')
  return {
    nameEdit: Boolean(Number(binaryStr.charAt(0))),
    deleteEdit: Boolean(Number(binaryStr.charAt(1))),
    defaultEdit: Boolean(Number(binaryStr.charAt(2))),
    percentEdit: Boolean(Number(binaryStr.charAt(3))),
    nullEdit: Boolean(Number(binaryStr.charAt(4))),
    uniqueEdit: Boolean(Number(binaryStr.charAt(5))),
    hiddenEdit: Boolean(Number(binaryStr.charAt(6))),
    optionsEdit: Boolean(Number(binaryStr.charAt(7)))
  }
}
