// components/Loader.tsx
export default function Loader() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-black bg-opacity-70 z-50">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
}
