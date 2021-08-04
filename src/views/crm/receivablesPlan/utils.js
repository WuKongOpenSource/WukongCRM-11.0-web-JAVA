// 回款状态 0 待回款 1 回款完成 2 部分回款 3 作废 4 逾期 5 待生效
export function getPlanReceivablesStatusName(receivedStatus) {
  if (receivedStatus == 0) {
    return '待回款'
  } else if (receivedStatus == 1) {
    return '回款完成'
  } else if (receivedStatus == 2) {
    return '部分回款'
  } else if (receivedStatus == 3) {
    return '作废'
  } else if (receivedStatus == 4) {
    return '逾期'
  } else if (receivedStatus == 5) {
    return '待生效'
  }
}
