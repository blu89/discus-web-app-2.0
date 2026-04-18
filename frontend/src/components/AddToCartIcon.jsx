export default function AddToCartIcon({ isAdded = false }) {
  if (isAdded) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-full h-full"
      >
        <polyline
          points="20 6 9 17 4 12"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      {/* Shopping bag */}
      <path d="M9 2C9 1.44772 9.44772 1 10 1H14C14.5523 1 15 1.44772 15 2V3H9V2Z" />
      <path d="M6 3H18C19.1046 3 20 3.89543 20 5V17C20 18.1046 19.1046 19 18 19H6C4.89543 19 4 18.1046 4 17V5C4 3.89543 4.89543 3 6 3Z" />
      {/* Plus sign */}
      <line x1="12" y1="8" x2="12" y2="15" />
      <line x1="8.5" y1="11.5" x2="15.5" y2="11.5" />
    </svg>
  );
}
