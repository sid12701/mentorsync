import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="w-full border-b border-purple-200 bg-white">
      <div className="max-w-[1060px] mx-auto px-4">
        <nav className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-8">
            <div className="text-purple-700 font-bold text-xl">MentorSync</div>
            <div className="hidden md:flex items-center space-x-6">
              <button className="text-gray-700 hover:text-purple-700 text-sm font-medium transition-colors">Platform</button>
              <button className="text-gray-700 hover:text-purple-700 text-sm font-medium transition-colors">Features</button>
              <button className="text-gray-700 hover:text-purple-700 text-sm font-medium transition-colors">Pricing</button>
            </div>
          </div>
          <Button variant="ghost" className="text-gray-700 hover:bg-purple-100 hover:text-purple-700 transition-colors">
            Log in
          </Button>
        </nav>
      </div>
    </header>
  )
}
