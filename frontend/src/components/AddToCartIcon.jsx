export default function AddToCartIcon({ isAdded = false }) {
  if (isAdded) {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    );
  }

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Shopping bag handle */}
      <path d="M6 9a6 6 0 0 0 12 0"></path>
      {/* Shopping bag body */}
      <rect x="3" y="9" width="18" height="13" rx="2" ry="2"></rect>
      {/* Plus sign */}
      <line x1="12" y1="13" x2="12" y2="19"></line>
      <line x1="9" y1="16" x2="15" y2="16"></line>
    </svg>
  );
}
