import { Router } from 'express';
import Project from '@/app/schemas/Project';
import Slugify from '@/utils/Slugify';
import AuthMiddleware from '@/app/middlewares/Auth';

const router = new Router();

router.get('/', (req, res) => {
  Project.find()
    .then((projects) => {
      res.status(200).send(projects);
    })
    .catch((err) => {
      console.error('Error when trying to fetch projects', err);

      res.status(400).send({
        error: 'Could not fetch all projects',
      });
    });
});

router.get('/id/:projectId', (req, res) => {
  const { projectId } = req.params;

  Project.findById(projectId)
    .then((project) => {
      res.status(200).send(project);
    })
    .catch((err) => {
      console.error('Error when trying to fetch the specific project', err);

      res.status(400).send({
        error: 'Error fetching this project',
      });
    });
});

router.get('/:projectSlug', (req, res) => {
  const { projectSlug } = req.params;

  Project.findOne({ slug: projectSlug })
    .then((project) => {
      res.status(200).send(project);
    })
    .catch((err) => {
      console.error('Error when trying to fetch the specific project', err);

      res.status(400).send({
        error: 'Error fetching this project',
      });
    });
});

router.post('/', AuthMiddleware, (req, res) => {
  const { title, description, category } = req.body;

  Project.create({ title, description, category })
    .then((project) => {
      res.status(200).send(project);
    })
    .catch((err) => {
      console.error('Error saving the new project to the database', err);

      res.status(400).send({
        error: 'The project could not be saved. Check the data sent',
      });
    });
});

router.put('/:projectId', AuthMiddleware, (req, res) => {
  const { projectId } = req.params;
  const { title, description, category } = req.body;
  let slug = undefined;

  if (title) {
    slug = Slugify(title);
  }

  Project.findByIdAndUpdate(
    projectId,
    { title, slug, description, category },
    { new: true },
  )
    .then((project) => {
      res.status(200).send(project);
    })
    .catch((err) => {
      console.error('Error updating the project at the database', err);

      res.status(400).send({
        error: 'The project could not be updated. Check the data sent',
      });
    });
});

router.delete('/:projectId', AuthMiddleware, (req, res) => {
  const { projectId } = req.params;

  Project.findByIdAndRemove(projectId)
    .then(() => {
      res.status(200).send({
        message: 'Project removed successfully',
      });
    })
    .catch((err) => {
      console.error('Error deleting the project at the database', err);

      res.status(400).send({
        error: 'Error deleting this project',
      });
    });
});

export default router;
