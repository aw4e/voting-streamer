import { useState } from 'react'
import { Undo2 } from 'lucide-react'
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
import { Button } from '@/components/ui/button'

type Props = { canUndo: boolean; onUndo: () => void; onReset: () => void }

export function VoteActions({ canUndo, onUndo, onReset }: Props) {
  const [open, setOpen] = useState(false)
  const label = 'font-mono text-[11px] uppercase tracking-wider h-11 md:h-8'

  return (
    <div className="flex gap-2 border-t border-border px-6 py-4">
      <Button variant="outline" disabled={!canUndo} onClick={onUndo} className={label}>
        <Undo2 data-icon="inline-start" />
        Undo
      </Button>
      <Button variant="destructive" onClick={() => setOpen(true)} className={label}>
        Reset
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset semua total?</AlertDialogTitle>
            <AlertDialogDescription>
              Total semua game jadi 0 dan timer dihapus. Daftar game tetap ada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                onReset()
                setOpen(false)
              }}
            >
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
