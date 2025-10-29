import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertTriangle, Trash2, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => Promise<void>;
  mentorEmail: string;
}

export default function DeleteAccountDialog({
  open,
  onOpenChange,
  onConfirmDelete,
  mentorEmail,
}: DeleteAccountDialogProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [understandConsequences, setUnderstandConsequences] = useState(false);
  const [confirmDataLoss, setConfirmDataLoss] = useState(false);
  const [confirmNoUndo, setConfirmNoUndo] = useState(false);

  const CONFIRMATION_PHRASE = "DELETE MY ACCOUNT";

  const handleClose = () => {
    if (!loading) {
      setStep(1);
      setConfirmationText("");
      setUnderstandConsequences(false);
      setConfirmDataLoss(false);
      setConfirmNoUndo(false);
      onOpenChange(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onConfirmDelete();
      handleClose();
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setLoading(false);
    }
  };

  const canProceedToStep2 = understandConsequences && confirmDataLoss && confirmNoUndo;
  const canProceedToStep3 = confirmationText === CONFIRMATION_PHRASE;

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <AlertDialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <AlertDialogTitle className="text-xl font-semibold">
                  {step === 1 && "Delete Account"}
                  {step === 2 && "Type to Confirm"}
                  {step === 3 && "Final Confirmation"}
                </AlertDialogTitle>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              Step {step} of 3
            </Badge>
          </div>
        </AlertDialogHeader>

        {/* Step 1: Warning & Consequences */}
        {step === 1 && (
          <div className="space-y-3">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm font-medium text-red-900 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" />
                This action is permanent and cannot be undone
              </p>
            </div>

            <AlertDialogDescription className="text-sm space-y-3">
              <p className="font-medium text-gray-900">
                The following data will be permanently deleted:
              </p>
              
              <div className="grid grid-cols-1 gap-1.5 text-xs text-gray-700">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  <span>Profile, bio, and personal information</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  <span>Expertise, certifications, and education</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  <span>Availability calendar and bookings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  <span>Session history and student connections</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  <span>Reviews, ratings, and messages</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  <span>Wallet balance and earnings data</span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2.5">
                <p className="text-xs text-yellow-900">
                  <strong>Note:</strong> Resolve pending sessions and payments before deletion.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="understand"
                    checked={understandConsequences}
                    onCheckedChange={(checked) => setUnderstandConsequences(checked as boolean)}
                    className="mt-0.5"
                  />
                  <label
                    htmlFor="understand"
                    className="text-xs leading-tight cursor-pointer select-none"
                  >
                    I understand deletion is permanent and irreversible
                  </label>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="data-loss"
                    checked={confirmDataLoss}
                    onCheckedChange={(checked) => setConfirmDataLoss(checked as boolean)}
                    className="mt-0.5"
                  />
                  <label
                    htmlFor="data-loss"
                    className="text-xs leading-tight cursor-pointer select-none"
                  >
                    I acknowledge all data will be permanently deleted
                  </label>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="no-undo"
                    checked={confirmNoUndo}
                    onCheckedChange={(checked) => setConfirmNoUndo(checked as boolean)}
                    className="mt-0.5"
                  />
                  <label
                    htmlFor="no-undo"
                    className="text-xs leading-tight cursor-pointer select-none"
                  >
                    I confirm there is no way to recover my account
                  </label>
                </div>
              </div>
            </AlertDialogDescription>

            <AlertDialogFooter className="gap-2 pt-2">
              <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={() => setStep(2)}
                disabled={!canProceedToStep2 || loading}
                size="sm"
              >
                Continue
              </Button>
            </AlertDialogFooter>
          </div>
        )}

        {/* Step 2: Type Confirmation */}
        {step === 2 && (
          <div className="space-y-3">
            <AlertDialogDescription className="text-sm space-y-3">
              <p className="text-gray-900">
                Type <strong className="text-red-600 font-mono text-xs">{CONFIRMATION_PHRASE}</strong> to confirm:
              </p>

              <div className="space-y-1.5">
                <Label htmlFor="confirmation" className="text-xs font-medium">
                  Confirmation Text
                </Label>
                <Input
                  id="confirmation"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder={CONFIRMATION_PHRASE}
                  className="font-mono text-sm h-9"
                  disabled={loading}
                  autoComplete="off"
                />
                <p className="text-xs text-gray-500">
                  Case-sensitive • Must match exactly
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-2.5">
                <p className="text-xs text-red-900 flex items-start gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                  <span>Account deletion will begin immediately after confirmation</span>
                </p>
              </div>
            </AlertDialogDescription>

            <AlertDialogFooter className="gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep(1)} disabled={loading} size="sm">
                Back
              </Button>
              <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={() => setStep(3)}
                disabled={!canProceedToStep3 || loading}
                size="sm"
              >
                Continue
              </Button>
            </AlertDialogFooter>
          </div>
        )}

        {/* Step 3: Final Confirmation with Email */}
        {step === 3 && (
          <div className="space-y-3">
            <AlertDialogDescription className="text-sm space-y-3">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-900 font-semibold text-sm mb-1 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Final Chance to Cancel
                </p>
                <p className="text-red-800 text-xs">
                  Account <strong className="font-mono">{mentorEmail}</strong> will be permanently deleted.
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <h4 className="font-semibold text-gray-900 text-xs mb-2">What happens next:</h4>
                <ol className="space-y-1 text-xs text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 font-medium">1.</span>
                    <span>Account deleted immediately</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 font-medium">2.</span>
                    <span>Logged out from all devices</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 font-medium">3.</span>
                    <span>Profile removed from listings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 font-medium">4.</span>
                    <span>All data permanently erased</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 font-medium">5.</span>
                    <span>Confirmation email sent</span>
                  </li>
                </ol>
              </div>

              <p className="text-xs text-gray-600 italic">
                Are you absolutely sure? This cannot be reversed.
              </p>
            </AlertDialogDescription>

            <AlertDialogFooter className="gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep(2)} disabled={loading} size="sm">
                Back
              </Button>
              <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600 h-8 px-3 text-xs"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Delete Forever
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
