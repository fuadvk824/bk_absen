import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type ConfirmCloseModalProps = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmCloseModal({
  open,
  onConfirm,
  onCancel,
}: ConfirmCloseModalProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Perubahan belum disimpan
          </AlertDialogTitle>
          <AlertDialogDescription>
            Jika kamu menutup form ini, semua perubahan akan hilang.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            Batal
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Tutup Form
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
