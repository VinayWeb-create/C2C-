import asyncHandler from '../utils/asyncHandler.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Create a new project (Admin only)
// @route   POST /api/projects
// @access  Private/Admin
export const createProject = asyncHandler(async (req, res) => {
    req.body.postedBy = req.user._id;
    const project = await Project.create(req.body);
    res.status(201).json({ success: true, project });
});

// @desc    Get all open projects
// @route   GET /api/projects
// @access  Private
export const getProjects = asyncHandler(async (req, res) => {
    const projects = await Project.find({ status: 'open' })
        .populate('postedBy', 'name email')
        .populate('applications.provider', 'name email badges');
    res.json({ success: true, projects });
});

// @desc    Apply for a project (Provider only)
// @route   POST /api/projects/:id/apply
// @access  Private/Provider
export const applyForProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    if (project.status !== 'open') {
        res.status(400);
        throw new Error('Project is no longer accepting applications');
    }

    // Check if player already applied
    const alreadyApplied = project.applications.find(
        (app) => app.provider.toString() === req.user._id.toString()
    );

    if (alreadyApplied) {
        res.status(400);
        throw new Error('You have already applied for this project');
    }

    project.applications.push({
        provider: req.user._id,
        notes: req.body.notes,
        contactEmail: req.body.contactEmail || req.user.email,
        contactPhone: req.body.contactPhone
    });

    await project.save();

    // Send confirmation email
    try {
        await sendEmail({
            email: req.body.contactEmail || req.user.email,
            subject: 'Project Application Successful - C2C Platform',
            message: `Hi ${req.user.name},\n\nYour application for the project "${project.title}" has been submitted successfully.\n\nOur team will review your profile and badges. You will be notified once the admin makes a decision.\n\nBest regards,\nC2C Team`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                    <h2 style="color: #4f46e5;">Application Received! 🚀</h2>
                    <p>Hi <strong>${req.user.name}</strong>,</p>
                    <p>Your application for <strong>"${project.title}"</strong> has been successfully recorded on the Campus to Corporate platform.</p>
                    <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0; font-size: 14px; color: #64748b;">Project Title:</p>
                        <p style="margin: 5px 0 0 0; font-weight: bold; color: #1e293b;">${project.title}</p>
                    </div>
                    <p>What's next? The project administrator will review your merit badges and skills. You'll hear from us soon via email or your dashboard if you're shortlisted.</p>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                    <p style="font-size: 12px; color: #94a3b8; text-align: center;">This is an automated message from Smart Local Life / C2C Platform.</p>
                </div>
            `
        });
    } catch (err) {
        console.error('Email sending failed:', err);
        // We don't throw error here to avoid rolling back the application
    }

    res.json({ success: true, message: 'Application submitted successfully' });
});

// @desc    Get project applications (Admin only)
// @route   GET /api/projects/:id/applications
// @access  Private/Admin
export const getProjectApplications = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id)
        .populate('applications.provider', 'name email professionalInfo badges');

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    res.json({ success: true, applications: project.applications });
});

// @desc    Assign project to a provider (Admin only)
// @route   PUT /api/projects/:id/assign
// @access  Private/Admin
export const assignProject = asyncHandler(async (req, res) => {
    const { providerId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    if (!providerId) {
        res.status(400);
        throw new Error('Missing providerId in request body');
    }

    project.status = 'assigned';
    project.assignedTo = providerId;
    
    // Update application status
    let found = false;
    project.applications.forEach(app => {
        const appProviderId = app.provider?.toString();
        const targetId = providerId.toString();

        if (appProviderId === targetId) {
            app.status = 'accepted';
            found = true;
        } else {
            app.status = 'rejected';
        }
    });

    if (!found) {
        res.status(404);
        throw new Error('Applicant not found in this project');
    }

    await project.save();
    res.json({ success: true, message: 'Project assigned successfully', project });
});

// @desc    Get my applications (Provider only)
// @route   GET /api/projects/my-applications
// @access  Private/Provider
export const getMyApplications = asyncHandler(async (req, res) => {
    const projects = await Project.find({
        'applications.provider': req.user._id
    }).select('title status budget deadline');

    res.json({ success: true, projects });
});
