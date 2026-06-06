import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export const DeleteHabitDialog = ({
  deleteHabitTarget,
  setDeleteHabitTarget,
  deleteHabit,
}: {
  deleteHabitTarget: string | null
  setDeleteHabitTarget: (target: string | null) => void
  deleteHabit: (target: string) => void
}) => {
  return (
    <AlertDialog
      open={!!deleteHabitTarget}
      onOpenChange={(v) => !v && setDeleteHabitTarget(null)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete permanently?</AlertDialogTitle>
          <AlertDialogDescription>
            This cannot be undone. All completion history will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              deleteHabit(deleteHabitTarget!)
              setDeleteHabitTarget(null)
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
