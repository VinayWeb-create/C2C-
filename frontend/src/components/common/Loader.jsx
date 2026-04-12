const Loader = ({ size = 'md', text = '' }) => {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin`} />
      {text && <p className="text-sm text-gray-500 dark:text-gray-400">{text}</p>}
    </div>
  );
};

export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader size="lg" text="Loading..." />
  </div>
);

export default Loader;
