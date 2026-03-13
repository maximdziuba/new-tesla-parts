import Link from 'next/link';

const ShopLogo = () => {
  return (
    <Link href="/" className="flex items-center gap-3 group">
      <div className="flex items-center justify-center px-4 py-2 border-2 border-blue-600 bg-white dark:bg-slate-900 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 rounded-sm">
        <span className="text-blue-600 group-hover:text-white dark:text-blue-400 font-bold text-xl tracking-tighter uppercase animate-pulse">MOCK LOGO</span>
      </div>
    </Link>
  );
};

export default ShopLogo;
