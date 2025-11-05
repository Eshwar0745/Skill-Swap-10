export default function Footer() {
  return (
    <footer className="border-t border-border bg-card py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-primary-foreground text-sm font-bold">
              SS
            </div>
            <span className="font-semibold text-foreground">SkillSwap</span>
          </div>

          <div className="text-sm text-muted-foreground text-center md:text-left">
            © 2025 SkillSwap. Learn and share skills together.
          </div>

          <div className="flex gap-4 text-sm">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Privacy
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Terms
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
