import { useState } from "react";

type SearchBarProps = {
    onSearch: (query: string) => void;
};
export default function SearchBar({ onSearch }: SearchBarProps) {
    const [query, setQuery] = useState<string>("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <div className="flex justify-center w-full h-full border border-black/10 rounded-lg shadow-sm overflow-hidden">
            <form onSubmit={handleSearch} className="flex items-center w-full ">
                <input
                    type="text"
                    placeholder="Search..."
                    className="flex-grow p-2 outline-none bg-white/10"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button type="submit" className="bg-red-500 text-white px-2 h-full hover:bg-red-600 flex justify-center items-center">
                    <i className='bx bx-search text-xl ' ></i>
                </button>
            </form>
        </div>
    );
}