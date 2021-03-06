import * as backend from '../backend';
import * as languages from './languages';
import * as sentences from './sentences';

let dispatch;
let getState;
const exampleSentences = [
  'This is a test.',
  'This too!',
];

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(backend, 'sendRequest');
  dispatch = jest.fn();
  getState = jest.fn().mockReturnValue({ languages: { languages: ['en'] } });
});

describe('loadRejectedSentences', () => {
  test('should load rejected sentences', async () => {
    backend.sendRequest.mockImplementation(() => exampleSentences);
    await sentences.loadRejectedSentences()(dispatch);
    expect(backend.sendRequest.mock.calls[0][0]).toEqual('sentences/rejected');
    expect(dispatch.mock.calls[0][0]).toEqual({
      type: sentences.ACTION_LOAD_REJECTED_SENTENCES,
    });
    expect(dispatch.mock.calls[1][0]).toEqual({
      type: sentences.ACTION_GOT_REJECTED_SENTENCES,
      sentences: exampleSentences,
    });
  });

  test('should not throw on error', async () => {
    const error = new Error('NOPE');
    backend.sendRequest.mockImplementation(() => { throw error; });
    expect(sentences.loadRejectedSentences()(dispatch)).resolves.not.toThrow(error);
    expect(dispatch.mock.calls[1][0]).toEqual({
      type: sentences.ACTION_REJECTED_SENTENCES_FAILURE,
      errorMessage: 'NOPE',
    });
  });
});

describe('resetReviewMessage', () => {
  test('should reset message', async () => {
    await sentences.resetReviewMessage()(dispatch);
    expect(dispatch.mock.calls[0][0]).toEqual({
      type: sentences.ACTION_REVIEW_RESET_MESSAGE,
    });
  });
});

describe('loadSentences', () => {
  test('should load sentences', async () => {
    const language = 'en';
    backend.sendRequest.mockImplementation(() => exampleSentences);
    await sentences.loadSentences(language)(dispatch);
    expect(backend.sendRequest.mock.calls[0][0]).toEqual(`sentences/review?locale=${language}`);
    expect(dispatch.mock.calls[0][0]).toEqual({
      type: sentences.ACTION_LOAD_SENTENCES,
    });
    expect(dispatch.mock.calls[1][0]).toEqual({
      type: sentences.ACTION_GOT_SENTENCES,
      sentences: exampleSentences,
    });
  });

  test('should not throw on error', async () => {
    const error = new Error('NOPE');
    backend.sendRequest.mockImplementation(() => { throw error; });
    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(sentences.loadSentences()(dispatch)).resolves.not.toThrow(error);
    expect(console.error.mock.calls[0][0]).toEqual(error);
  });
});

describe('reviewSentences', () => {
  test('should upload votes and fetch latest sentences', async () => {
    const data = { foo: 'bar' };
    backend.sendRequest.mockImplementation(() => exampleSentences);
    await sentences.reviewSentences(data)(dispatch);
    expect(backend.sendRequest.mock.calls[0][0]).toEqual('votes');
    expect(backend.sendRequest.mock.calls[0][1]).toEqual('PUT');
    expect(backend.sendRequest.mock.calls[0][2]).toEqual(data);
    expect(dispatch.mock.calls[0][0]).toEqual({
      type: sentences.ACTION_REVIEWED_SENTENCES,
    });
    const loadSentencesAction = dispatch.mock.calls[1][0];
    loadSentencesAction(dispatch);
    expect(dispatch.mock.calls[2][0]).toEqual({
      type: sentences.ACTION_LOAD_SENTENCES,
    });
  });

  test('should not throw on error', async () => {
    const error = new Error('NOPE');
    backend.sendRequest.mockImplementation(() => { throw error; });
    expect(sentences.reviewSentences()(dispatch)).resolves.not.toThrow(error);
    expect(dispatch.mock.calls[0][0]).toEqual({
      type: sentences.ACTION_REVIEW_SENTENCES_FAILURE,
      errorMessage: 'NOPE',
    });
  });
});

describe('uploadSentences', () => {
  test('should upload sentences', async () => {
    const data = {
      source: 'Test Source',
      locale: 'en',
      sentences: exampleSentences,
    };
    backend.sendRequest.mockImplementation(() => {});
    const returnedSentences = await sentences.uploadSentences(data)(dispatch, getState);
    expect(backend.sendRequest.mock.calls[0][0]).toEqual('sentences');
    expect(backend.sendRequest.mock.calls[0][1]).toEqual('PUT');
    expect(backend.sendRequest.mock.calls[0][2]).toEqual(data);
    expect(dispatch.mock.calls[0][0]).toEqual({
      type: sentences.ACTION_SUBMIT_SENTENCES_REQUEST,
    });
    expect(dispatch.mock.calls[1][0]).toEqual({
      type: sentences.ACTION_SUBMIT_SENTENCES_DONE,
    });
    expect(returnedSentences).toEqual({});
  });

  test('should set failed sentences', async () => {
    const data = {
      source: 'Test Source',
      locale: 'en',
      sentences: exampleSentences,
    };
    const errors = [{
      sentence: 'I failed',
    }];
    backend.sendRequest.mockImplementation(() => ({ errors }));
    const returnedSentences = await sentences.uploadSentences(data)(dispatch, getState);
    expect(dispatch.mock.calls[2][0]).toEqual({
      type: sentences.ACTION_SUBMIT_SENTENCES_ERRORS,
      errors,
    });
    expect(returnedSentences).toEqual({ errors });
  });

  test('should add language if not yet in user profile', async () => {
    const data = {
      source: 'Test Source',
      locale: 'en',
      sentences: exampleSentences,
    };
    getState.mockReturnValue({ languages: { languages: [] } });
    backend.sendRequest.mockImplementation(() => ({ errors: [] }));
    await sentences.uploadSentences(data)(dispatch, getState);
    const addLanguageAction = dispatch.mock.calls[3][0];
    addLanguageAction(dispatch);
    expect(dispatch.mock.calls[4][0]).toEqual({
      type: languages.ACTION_ADD_LANGUAGE_REQUEST,
    });
  });

  test('should throw on error', async () => {
    const error = new Error('NOPE');
    const data = {
      source: 'Test Source',
      locale: 'en',
      sentences: exampleSentences,
    };
    backend.sendRequest.mockImplementation(() => { throw error; });
    expect(sentences.uploadSentences(data)(dispatch, getState)).rejects.toThrow(error);
    expect(dispatch.mock.calls[1][0]).toEqual({
      type: sentences.ACTION_SUBMIT_SENTENCES_DONE,
    });
  });
});
