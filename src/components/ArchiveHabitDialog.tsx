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

export const ArchiveDialog = ({
  archiveHabitTarget,
  setArchiveHabitTarget,
  archiveHabit,
}: {
  archiveHabitTarget: string | null
  setArchiveHabitTarget: (target: string | null) => void
  archiveHabit: (target: string) => void
}) => {
  return (
    <AlertDialog
      open={!!archiveHabitTarget}
      onOpenChange={(v) => !v && setArchiveHabitTarget(null)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archive this habit?</AlertDialogTitle>
          <AlertDialogDescription>
            It will be hidden from all views.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              archiveHabit(archiveHabitTarget!)
              setArchiveHabitTarget(null)
            }}
          >
            Archive
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
