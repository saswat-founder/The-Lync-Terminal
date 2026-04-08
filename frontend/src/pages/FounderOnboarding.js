import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  Check, 
  ArrowRight, 
  ArrowLeft,
  Building2,
  Link as LinkIcon,
  CheckCircle2,
  Shield
} from 'lucide-react';
import { BUSINESS_MODELS, STAGES } from '@/data/mockData';
import { toast } from 'sonner';

const FounderOnboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  
  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    businessModel: '',
    stage: '',
    integrations: []
  });

  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      toast.success('Onboarding complete!', {
        description: 'Welcome to Startup Intel. Your dashboard is ready.'
      });
      navigate('/founder');
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleIntegrationToggle = (integration) => {
    setFormData(prev => ({
      ...prev,
      integrations: prev.integrations.includes(integration)
        ? prev.integrations.filter(i => i !== integration)
        : [...prev.integrations, integration]
    }));
  };

  const integrationOptions = [
    { id: 'zoho', name: 'Zoho Books', description: 'Financial metrics', icon: '📊' },
    { id: 'hubspot', name: 'HubSpot', description: 'CRM and sales data', icon: '🎯' },
    { id: 'salesforce', name: 'Salesforce', description: 'Sales pipeline', icon: '☁️' },
    { id: 'jira', name: 'Jira', description: 'Project management', icon: '📋' },
    { id: 'github', name: 'GitHub', description: 'Code repository', icon: '💻' },
    { id: 'stripe', name: 'Stripe', description: 'Payment processing', icon: '💳' }
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">S</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold">Startup Intel</h1>
                <p className="text-sm text-muted-foreground">Founder Onboarding</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Step {step} of {totalSteps}</p>
              <p className="text-xs text-muted-foreground">{Math.round(progress)}% complete</p>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="space-y-6 py-6">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold">Welcome to Startup Intel</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  We'll help you set up your account and connect your data sources in just a few minutes.
                  Your data is secure and only shared with your investors.
                </p>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-6 space-y-3">
                <h3 className="font-semibold text-sm">What we'll do:</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-success" />
                    <span>Set up your company profile</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-success" />
                    <span>Connect your data sources</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-success" />
                    <span>Review your dashboard</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-success" />
                    <span>Start automated reporting</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Company Info */}
          {step === 2 && (
            <div className="space-y-6 py-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Company Information</h2>
                <p className="text-sm text-muted-foreground">Tell us about your startup</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    placeholder="Enter your company name"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://yourcompany.com"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Business Model */}
          {step === 3 && (
            <div className="space-y-6 py-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Business Model</h2>
                <p className="text-sm text-muted-foreground">Select your business model and stage</p>
              </div>
              
              <div>
                <Label className="mb-3 block">Business Model *</Label>
                <RadioGroup 
                  value={formData.businessModel}
                  onValueChange={(value) => setFormData({ ...formData, businessModel: value })}
                  className="space-y-2"
                >
                  {BUSINESS_MODELS.map(model => (
                    <div key={model} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50">
                      <RadioGroupItem value={model} id={model} />
                      <Label htmlFor={model} className="flex-1 cursor-pointer">
                        {model}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <div>
                <Label className="mb-3 block">Current Stage *</Label>
                <RadioGroup 
                  value={formData.stage}
                  onValueChange={(value) => setFormData({ ...formData, stage: value })}
                  className="space-y-2"
                >
                  {STAGES.map(stage => (
                    <div key={stage} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50">
                      <RadioGroupItem value={stage} id={stage} />
                      <Label htmlFor={stage} className="flex-1 cursor-pointer">
                        {stage}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          )}

          {/* Step 4: Integrations */}
          {step === 4 && (
            <div className="space-y-6 py-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Connect Your Data</h2>
                <p className="text-sm text-muted-foreground">
                  Select the tools you use. We'll pull data automatically to reduce manual reporting.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {integrationOptions.map(integration => (
                  <div
                    key={integration.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      formData.integrations.includes(integration.id)
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleIntegrationToggle(integration.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex items-center h-5">
                        <Checkbox
                          checked={formData.integrations.includes(integration.id)}
                          onCheckedChange={() => handleIntegrationToggle(integration.id)}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{integration.icon}</span>
                          <p className="font-medium">{integration.name}</p>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {integration.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <p className="text-sm text-muted-foreground text-center">
                You can add more integrations later from your dashboard
              </p>
            </div>
          )}

          {/* Step 5: Complete */}
          {step === 5 && (
            <div className="space-y-6 py-6">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mb-4">
                  <CheckCircle2 className="h-8 w-8 text-success" />
                </div>
                <h2 className="text-2xl font-semibold">You're All Set!</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Your account is ready. We'll start pulling data from your connected sources.
                </p>
              </div>
              
              <Card className="bg-muted/50">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Company</span>
                    </div>
                    <span className="text-sm">{formData.companyName}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Business Model</span>
                    </div>
                    <span className="text-sm">{formData.businessModel}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Stage</span>
                    </div>
                    <span className="text-sm">{formData.stage}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Integrations</span>
                    </div>
                    <span className="text-sm">{formData.integrations.length} connected</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <Button onClick={handleNext}>
              {step === totalSteps ? (
                <>Go to Dashboard</>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FounderOnboarding;