import React from 'react';
import { Button } from '../components/ui/Button';
import { PageTitle, Label } from '../components/ui/Typography';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { MethodologyTip } from '../components/ui/MethodologyTip';
import { GroupDivider } from '../components/ui/GroupDivider';
import { ArrowLeft, Plus, Trash2, Heart, Shield, Zap } from 'lucide-react';
import { motion } from 'motion/react';

const DesignSystemPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8 pb-32">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* Header */}
        <header className="space-y-4">
          <PageTitle>Design System</PageTitle>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-xl">
            A premium, high-contrast design system optimized for clarity, focus, and speed. 
            Built with React 19, Tailwind CSS 4, and Motion.
          </p>
        </header>

        {/* Foundations */}
        <section className="space-y-8">
          <Label>Foundations</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="w-12 h-12 bg-zinc-900 dark:bg-white rounded-lg mb-4" />
              <div className="font-bold">Primary</div>
              <div className="text-xs text-zinc-400">#000000 / #FFFFFF</div>
            </div>
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-lg mb-4" />
              <div className="font-bold">Secondary</div>
              <div className="text-xs text-zinc-400">Zinc 100 / 800</div>
            </div>
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="w-12 h-12 bg-zinc-400 rounded-lg mb-4" />
              <div className="font-bold">Accent</div>
              <div className="text-xs text-zinc-400">Zinc 400</div>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="space-y-8">
          <Label>Typography</Label>
          <div className="space-y-6">
            <div>
              <PageTitle>The quick brown fox jumps over the lazy dog</PageTitle>
              <div className="text-xs text-zinc-400 mt-2">PageTitle: text-4xl/font-black/tracking-tighter</div>
            </div>
            <div>
              <Label>Label Text Component</Label>
              <div className="text-xs text-zinc-400 mt-2">Label: text-[10px]/font-black/uppercase/tracking-[0.2em]</div>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className="space-y-8">
          <Label>Buttons</Label>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <div className="text-[10px] text-zinc-400 uppercase font-bold">Primary</div>
              <Button>Primary Action</Button>
            </div>
            <div className="space-y-2">
              <div className="text-[10px] text-zinc-400 uppercase font-bold">Secondary</div>
              <Button variant="secondary">Secondary Action</Button>
            </div>
            <div className="space-y-2">
              <div className="text-[10px] text-zinc-400 uppercase font-bold">Ghost</div>
              <Button variant="ghost">Ghost Action</Button>
            </div>
            <div className="space-y-2">
              <div className="text-[10px] text-zinc-400 uppercase font-bold">Danger</div>
              <Button variant="danger">Delete Item</Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 items-end">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large Button</Button>
          </div>

          <div className="flex gap-4">
            <Button><Plus className="w-4 h-4 mr-2" />With Icon</Button>
            <Button variant="secondary" className="w-12 h-12 p-0"><Heart className="w-5 h-5" /></Button>
          </div>
        </section>

        {/* Inputs */}
        <section className="space-y-8">
          <Label>Forms</Label>
          <div className="max-w-sm space-y-4">
            <Input label="Generic Input" placeholder="Type something..." />
            <Input label="With Icon" placeholder="Search..." icon={<Zap className="w-4 h-4" />} />
            <Input label="With Error" placeholder="Email" error="Please enter a valid email address" />
          </div>
        </section>

        {/* Components */}
        <section className="space-y-8">
          <Label>Components</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="text-xs font-bold text-zinc-400 uppercase">Methodology Tip</div>
              <MethodologyTip 
                title="Active Recall" 
                description="The most effective way to learn is by testing your knowledge, not just reading."
              />
            </div>
            <div className="space-y-4">
              <div className="text-xs font-bold text-zinc-400 uppercase">Group Divider</div>
              <GroupDivider label="Today's Tasks" />
            </div>
          </div>
        </section>

        {/* Modals */}
        <section className="space-y-8">
          <Label>Dialogs</Label>
          <Button onClick={() => setIsModalOpen(true)}>Open Modal Preview</Button>
          <Modal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            title="Design System Modal"
          >
            <div className="space-y-4">
              <p className="text-zinc-600 dark:text-zinc-400">
                This modal follows the system's clean glassmorphism and motion patterns.
              </p>
              <Button fullWidth onClick={() => setIsModalOpen(false)}>Close</Button>
            </div>
          </Modal>
        </section>

        <section className="space-y-8 pt-16 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="text-sm text-zinc-400 font-mono">v5.1.2-GOLD</div>
            <div className="flex gap-4">
              <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to App
              </Button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default DesignSystemPage;
