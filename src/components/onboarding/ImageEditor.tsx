import { useState, useRef, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RotateCcw, RotateCw, ZoomIn } from "lucide-react";

interface ImageEditorProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  onSave: (editedImage: Blob) => void;
}

export default function ImageEditor({ open, onClose, imageUrl, onSave }: ImageEditorProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleRotateLeft = () => {
    setRotation((prev) => {
      const newRotation = prev - 90;
      // Normalize to 0-360 range
      return newRotation < 0 ? newRotation + 360 : newRotation;
    });
  };

  const handleRotateRight = () => {
    setRotation((prev) => {
      const newRotation = prev + 90;
      // Normalize to 0-360 range
      return newRotation >= 360 ? newRotation - 360 : newRotation;
    });
  };

  const drawImage = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    
    // Guard clause - ensure canvas and image exist
    if (!canvas || !image || !image.complete || image.naturalWidth === 0) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size (fixed square for profile picture)
    const size = 250;
    canvas.width = size;
    canvas.height = size;

    // Clear canvas with white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    // Save context state
    ctx.save();

    // Move origin to center of canvas
    ctx.translate(size / 2, size / 2);

    // Apply rotation (convert degrees to radians)
    ctx.rotate((rotation * Math.PI) / 180);

    // Calculate aspect ratio and dimensions
    const imgWidth = image.naturalWidth;
    const imgHeight = image.naturalHeight;
    const imgAspect = imgWidth / imgHeight;

    // Calculate dimensions to fit the image in the canvas while maintaining aspect ratio
    let drawWidth, drawHeight;
    
    if (imgAspect > 1) {
      // Landscape image - width is larger
      drawWidth = size * zoom;
      drawHeight = drawWidth / imgAspect;
    } else {
      // Portrait or square image - height is larger or equal
      drawHeight = size * zoom;
      drawWidth = drawHeight * imgAspect;
    }

    // Draw image centered, scaled, and maintaining aspect ratio
    ctx.drawImage(
      image, 
      -drawWidth / 2, 
      -drawHeight / 2, 
      drawWidth, 
      drawHeight
    );

    // Restore context state
    ctx.restore();
  }, [zoom, rotation]);

  const handleImageLoad = () => {
    // Small delay to ensure image is fully loaded
    setTimeout(() => {
      drawImage();
    }, 10);
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("Canvas not available");
      return;
    }

    try {
      canvas.toBlob((blob) => {
        if (blob) {
          onSave(blob);
          // Reset state after saving
          setZoom(1);
          setRotation(0);
          // Close the dialog
          onClose();
        } else {
          console.error("Failed to create blob from canvas");
        }
      }, "image/jpeg", 0.95);
    } catch (error) {
      console.error("Error saving image:", error);
    }
  };

  // Effect to redraw when zoom or rotation changes
  useEffect(() => {
    drawImage();
  }, [zoom, rotation, drawImage]);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setZoom(1);
      setRotation(0);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Edit your photo</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Canvas Preview */}
          <div className="flex justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 backdrop-blur-sm">
            <div className="relative">
              <canvas
                ref={canvasRef}
                className="border-4 border-black rounded shadow-lg"
                style={{ width: "250px", height: "250px" }}
              />
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Preview"
                className="hidden"
                crossOrigin="anonymous"
                onLoad={handleImageLoad}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-3 bg-white/50 backdrop-blur-sm rounded-lg p-3 border border-gray-200/50">
            {/* Zoom Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <ZoomIn className="w-3.5 h-3.5" />
                  Zoom
                </label>
                <span className="text-xs text-gray-500">{(zoom * 100).toFixed(0)}%</span>
              </div>
              <Slider
                value={[zoom]}
                onValueChange={(values) => {
                  setZoom(values[0]);
                }}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Rotate Control */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Rotate</label>
              <div className="flex items-center gap-2 justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleRotateLeft}
                  className="h-9 w-9"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600 min-w-[50px] text-center font-medium">
                  {rotation}°
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleRotateRight}
                  className="h-9 w-9"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2.5"
          >
            Save profile photo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
