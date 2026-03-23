import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardBody, Button, Spinner } from '@/components/ui';
import { StageProgressTracker } from '@/components/workflow';
import LandingPagesList from '@/components/landing-pages/LandingPagesList';
import { ArrowLeft, CheckCircle, SkipForward } from 'lucide-react';
import { projectService } from '@/services/api';

export default function LandingPagesListPage() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [skipping, setSkipping] = useState(false);
  const [project, setProject] = useState(null);

  useEffect(() => {
    if (!projectId) {
      navigate('/projects');
      return;
    }
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await projectService.getProject(projectId);
      setProject(response.data);

      // Check if traffic strategy is completed
      if (!response.data.stages?.trafficStrategy?.isCompleted) {
        toast.error('Complete Traffic Strategy first to access Landing Pages');
        navigate('/projects');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Failed to load project');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipLandingPage = async () => {
    if (!confirm('Are you sure you want to skip the Landing Page stage? No landing page tasks will be created for this project.')) {
      return;
    }

    try {
      setSkipping(true);
      await projectService.skipLandingPageStage(projectId);
      toast.success('Landing page stage skipped. Proceeding to Creative Strategy.');
      navigate(`/creative-strategy?projectId=${projectId}`);
    } catch (error) {
      console.error('Error skipping landing page stage:', error);
      toast.error(error?.response?.data?.message || 'Failed to skip landing page stage');
    } finally {
      setSkipping(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(`/projects/${projectId}`)} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Landing Pages</h1>
          <p className="text-gray-600 mt-1">{project?.businessName}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Stage 5 of 6</div>
        </div>
      </div>

      {/* Completion Banner */}
      {project?.stages?.landingPage?.isCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <div>
            <h3 className="font-semibold text-green-800">Stage Completed!</h3>
            <p className="text-sm text-green-600">
              {project?.stages?.landingPage?.skipped
                ? 'Landing page stage was skipped. Proceed to Creative Strategy.'
                : 'You can proceed to Creative Strategy.'}
            </p>
          </div>
        </div>
      )}

      {/* Skip Option Banner */}
      {!project?.stages?.landingPage?.isCompleted && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <SkipForward className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900">No Landing Page Required?</h3>
              <p className="text-sm text-amber-700 mt-1">
                If this project doesn't need a landing page, you can skip this stage and proceed directly to Creative Strategy.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSkipLandingPage}
                loading={skipping}
                className="mt-3 border-amber-300 text-amber-700 hover:bg-amber-100"
              >
                <SkipForward className="w-4 h-4 mr-2" />
                Skip Landing Page Stage
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Progress */}
      <Card>
        <CardBody className="p-4">
          <StageProgressTracker stages={project?.stages} currentStage={project?.currentStage} />
        </CardBody>
      </Card>

      {/* Landing Pages List */}
      <Card>
        <CardBody className="p-6">
          <LandingPagesList projectId={projectId} />
        </CardBody>
      </Card>
    </div>
  );
}