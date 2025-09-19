// import { useEffect, useState } from 'react';

// export default function Switch() {
//   const [on, setOn] = useState(() => localStorage.getItem('theme') === 'dark');

//   useEffect(() => {
//     const root = document.documentElement;
//     if (on) {
//       root.classList.add('dark');
//       localStorage.setItem('theme', 'dark');
//     } else {
//       root.classList.remove('dark');
//       localStorage.setItem('theme', 'light');
//     }
//   }, [on]);

//   return (
//     <button
//       onClick={() => setOn(v => !v)}
//       className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${on ? 'bg-brand-600' : 'bg-gray-300'}`}
//       aria-label="Toggle dark mode"
//     >
//       <span
//         className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${on ? 'translate-x-6' : 'translate-x-1'}`}
//       />
//     </button>
//   );
// }

import { useEffect, useState } from 'react';

export default function Switch() {
  const [on, setOn] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    const root = document.documentElement;
    if (on) { root.classList.add('dark'); localStorage.setItem('theme', 'dark'); }
    else { root.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
  }, [on]);

  return (
    <button
      onClick={() => setOn(v => !v)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${on ? 'bg-brand-600' : 'bg-gray-300'}`}
      aria-label="Toggle dark mode"
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${on ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}