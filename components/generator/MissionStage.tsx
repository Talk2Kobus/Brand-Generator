import React from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Card } from '../ui/Card';

interface MissionStageProps {
  mission: string;
  setMission: (value: string) => void;
  companyName: string;
  setCompanyName: (value: string) => void;
  onSubmit: () => void;
}

export const MissionStage: React.FC<MissionStageProps> = ({ mission, setMission, companyName, setCompanyName, onSubmit }) => {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-white mb-2">Let's Build Your Brand</h2>
      <p className="text-lg text-center text-gray-400 mb-8">Start with your mission. If you already have a name, add it too.</p>
      <Card>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
          <div>
            <label htmlFor="mission" className="block text-sm font-medium text-gray-300 mb-2">Company Mission or Business Idea*</label>
            <Textarea
              id="mission"
              value={mission}
              onChange={(e) => setMission(e.target.value)}
              placeholder="e.g., 'An eco-friendly subscription box for house plants that helps people connect with nature.'"
              className="h-32 text-lg"
              required
            />
          </div>
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-300 mb-2">Company Name (Optional)</label>
            <Input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., 'Leafy Life'"
              className="text-lg"
            />
          </div>
          <Button type="submit" size="lg" disabled={!mission.trim()} className="w-full">
            {companyName.trim() ? 'Next: Define Brand Voice' : 'Next: Suggest Names'} &rarr;
          </Button>
        </form>
      </Card>
    </div>
  );
};