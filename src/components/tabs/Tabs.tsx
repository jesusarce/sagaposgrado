import { useState, ReactNode } from "react";

interface TabItem {
    id: string;
    label: string;
    title?: string;
    content: ReactNode;
}

interface TabsProps {
    tabs: TabItem[];
    defaultTab?: number;
}

const Tabs: React.FC<TabsProps> = ({
                                       tabs,
                                       defaultTab = 0,
                                   }) => {
    const [activeTab, setActiveTab] = useState(defaultTab);

    const current = tabs[activeTab];

    if (!tabs.length) return null;

    return (
        <div className="w-full">
            {/* Header */}
            <div
                role="tablist"
                className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-800 pb-2"
            >
                {tabs.map((tab, index) => {
                    const isActive = activeTab === index;

                    return (
                        <button
                            key={tab.id}
                            role="tab"
                            aria-selected={isActive}
                            onClick={() => setActiveTab(index)}
                            className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                ${
                                isActive
                                    ? "bg-brand-500 text-white shadow-sm"
                                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                            }
              `}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div className="mt-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                {current.title && (
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        {current.title}
                    </h2>
                )}

                <div className="text-gray-600 dark:text-gray-400">
                    {current.content}
                </div>
            </div>
        </div>
    );
};

export default Tabs;