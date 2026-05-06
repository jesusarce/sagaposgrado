import { useRef, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  isFullscreen?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className = "",
  showCloseButton = true,
  isFullscreen = false,
  size = "md",
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getWidth = () => {
    switch (size) {
      case "sm":
        return "420px";
      case "md":
        return "600px";
      case "lg":
        return "800px";
      case "xl":
        return "1000px";
      case "2xl":
        return "1280px";
      default:
        return "600px";
    }
  };

  return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
        {!isFullscreen && (
            <div
                className="absolute inset-0 bg-gray-400/50 backdrop-blur-[32px]"
                onClick={onClose}
            />
        )}
        <div
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            className={`
          relative
          bg-white dark:bg-gray-900
          rounded-3xl
          shadow-2xl
          max-h-[95vh]
          overflow-y-auto
          w-full
          ${className}
        `}
            style={{
              maxWidth: isFullscreen ? "100vw" : getWidth(),
              width: isFullscreen ? "100vw" : "100%",
              height: isFullscreen ? "100vh" : "auto",
              borderRadius: isFullscreen ? "0px" : undefined,
            }}
        >
          {showCloseButton && (
              <button
                  onClick={onClose}
                  className="absolute right-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white sm:right-6 sm:top-6"
              >
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                >
                  <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M6.043 16.541a1 1 0 101.414 1.415L12 13.414l4.543 4.542a1 1 0 001.414-1.414L13.414 12l4.543-4.542a1 1 0 10-1.414-1.415L12 10.586 7.457 6.044a1 1 0 10-1.414 1.414L10.586 12l-4.543 4.541z"
                      fill="currentColor"
                  />
                </svg>
              </button>
          )}
          <div>{children}</div>
        </div>
      </div>
  );
};