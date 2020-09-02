import { Router } from 'express';
import Project from '@/app/schemas/Project';
import Slugify from '@/utils/Slugify';

const router = new Router();

router.get('/', (req, res) => {
  Project.find()
    .then((projects) => {
      res.status(200).send(projects);
    })
    .catch((err) => {
      console.error('Error when trying to fetch projects', err);

      res.status(400).send({
        error: 'Não foi possível buscar os projetos',
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
        error: 'Erro ao buscar o projeto específico',
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
        error: 'Erro ao buscar o projeto específico',
      });
    });
});

router.post('/', (req, res) => {
  const { title, slug, description, category } = req.body;

  Project.create({ title, slug, description, category })
    .then((project) => {
      res.status(200).send(project);
    })
    .catch((err) => {
      console.error('Error saving the new project to the database', err);

      res.status(400).send({
        error: 'Não foi possível salvar o projeto. Verifique os dados enviados',
      });
    });
});

router.put('/:projectId', (req, res) => {
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
        error:
          'Não foi possível atualizar o projeto. Verifique os dados enviados',
      });
    });
});

router.delete('/:projectId', (req, res) => {
  const { projectId } = req.params;

  Project.findByIdAndRemove(projectId)
    .then(() => {
      res.status(200).send({
        message: 'Projeto removido com sucesso',
      });
    })
    .catch((err) => {
      console.error('Error deleting the project at the database', err);

      res.status(400).send({
        error: 'Erro ao deletar o projeto específico',
      });
    });
});

export default router;
