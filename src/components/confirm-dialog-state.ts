export type ConfirmDialogState = {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
}

export const initialConfirmState: ConfirmDialogState = {
  open: false,
  title: '',
  message: '',
  onConfirm: () => {},
}
