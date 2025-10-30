const els = {
  category: document.getElementById('category'),
  filename: document.getElementById('filename'),
  title: document.getElementById('title'),
  tags: document.getElementById('tags'),
  thumbnail: document.getElementById('thumbnail'),
  image: document.getElementById('image'),
  video: document.getElementById('video'),
  audio: document.getElementById('audio'),
  link: document.getElementById('link'),
  shortDescription: document.getElementById('shortDescription'),
  fullText: document.getElementById('fullText'),
  resetBtn: document.getElementById('resetBtn'),
  uploadBtn: document.getElementById('uploadBtn'),
  submitMessage: document.getElementById('submitMessage'),
  errors: {
    category: document.getElementById('categoryError'),
    filename: document.getElementById('filenameError'),
    title: document.getElementById('titleError'),
    tags: document.getElementById('tagsError'),
    thumbnail: document.getElementById('thumbnailError'),
    image: document.getElementById('imageError'),
    video: document.getElementById('videoError'),
    audio: document.getElementById('audioError'),
    link: document.getElementById('linkError'),
    shortDescription: document.getElementById('shortDescriptionError'),
    fullText: document.getElementById('fullTextError')
  }
};

function initForm() {
  resetToInitial();
  bindEvents();
}

function resetToInitial() {
  els.category.disabled = false;
  els.category.value = '';
  for (const k of ['filename','title','tags','thumbnail','image','video','audio','link','shortDescription','fullText']) {
    const e = els[k];
    if (e.type === 'file') e.value = '';
    else e.value = '';
    e.disabled = true;
  }
  clearErrors();
  els.submitMessage.textContent = '';
  // ensure category listeners are ready
}

function clearErrors() {
  Object.values(els.errors).forEach(n => { n.textContent = ''; });
}

function bindEvents() {
  els.category.addEventListener('change', onCategoryChange);
  els.resetBtn.addEventListener('click', () => {
    resetToInitial();
    document.dispatchEvent(new CustomEvent('formReset'));
  });

  els.filename.addEventListener('input', onFilenameInput);
  els.filename.addEventListener('blur', validateFilename);

  els.title.addEventListener('input', validateTitle);
  els.tags.addEventListener('input', validateTags);

  els.thumbnail.addEventListener('change', validateThumbnail);

  els.image.addEventListener('change', () => onMediaSelected('image'));
  els.video.addEventListener('change', () => onMediaSelected('video'));
  els.audio.addEventListener('change', () => onMediaSelected('audio'));

  // if cleared, re-enable
  [els.image, els.video, els.audio].forEach(el => {
    el.addEventListener('input', () => {
      if (!el.value) onMediaCleared();
    });
  });

  els.link.addEventListener('input', validateLink);
  els.fullText.addEventListener('blur', validateFullText);

  els.uploadBtn.addEventListener('click', async () => {
    clearErrors();
    const ok = await validateAll();
    if (!ok) return;
    const formData = collectFormValues();
    document.dispatchEvent(new CustomEvent('formReadyForUpload', { detail: formData }));
  });

  document.addEventListener('uploadSuccess', () => {
    els.submitMessage.textContent = 'Upload succeeded';
    resetToInitial();
  });
  document.addEventListener('uploadFail', (e) => {
    els.submitMessage.textContent = 'Upload failed: ' + (e.detail?.message || 'unknown error');
  });
}

function onCategoryChange() {
  clearErrors();
  const cat = els.category.value;
  if (!cat) {
    // keep other fields disabled
    for (const k of ['filename','title','tags','thumbnail','image','video','audio','link','shortDescription','fullText']) {
      els[k].disabled = true;
      if (els[k].type === 'file') els[k].value = '';
      else els[k].value = '';
    }
    return;
  }

  // enable all, then apply category-specific disables
  for (const k of ['filename','title','tags','thumbnail','image','video','audio','link','shortDescription','fullText']) {
    els[k].disabled = false;
  }

  if (cat === 'fact sheet') {
    els.audio.disabled = true; els.video.disabled = true;
    els.audio.value = ''; els.video.value = '';
  } else if (cat === 'portfolio') {
    els.fullText.disabled = true; els.fullText.value = '';
  } else if (cat === 'demo') {
    els.image.disabled = true; els.link.disabled = true; els.fullText.disabled = true;
    els.image.value = ''; els.link.value = ''; els.fullText.value = '';
  } else if (cat === 'moodboard') {
    els.audio.disabled = true; els.video.disabled = true;
    els.audio.value = ''; els.video.value = '';
  } else if (cat === 'general') {
    // no starter disables for 'general'
  }

  enableCategoryLocking();
}

function enableCategoryLocking() {
  const onFirstOtherChange = (e) => {
    if (e.target === els.category) return;
    if (hasAnyFieldValueExceptCategory()) {
      els.category.disabled = true;
      for (const k of ['filename','title','tags','thumbnail','image','video','audio','link','shortDescription','fullText']) {
        els[k].removeEventListener('input', onFirstOtherChange);
        els[k].removeEventListener('change', onFirstOtherChange);
      }
    }
  };
  for (const k of ['filename','title','tags','thumbnail','image','video','audio','link','shortDescription','fullText']) {
    els[k].addEventListener('input', onFirstOtherChange);
    els[k].addEventListener('change', onFirstOtherChange);
  }
}

function hasAnyFieldValueExceptCategory() {
  return Boolean(
    els.filename.value ||
    els.title.value ||
    els.tags.value ||
    els.thumbnail.value ||
    els.image.value ||
    els.video.value ||
    els.audio.value ||
    els.link.value ||
    els.shortDescription.value ||
    els.fullText.value
  );
}

/* validation & helpers */

function onFilenameInput() {
  const raw = els.filename.value;
  const transformed = raw.toLowerCase().replace(/\s+/g, '_');
  els.filename.value = transformed;
}

function validateFilename() {
  const v = els.filename.value || '';
  if (v.length > 20) {
    els.errors.filename.textContent = 'Filename must be max 20 characters; field cleared.';
    els.filename.value = '';
    return false;
  }
  return true;
}

function validateTitle() {
  const v = els.title.value || '';
  if (v.length > 50) {
    els.errors.title.textContent = 'Title must be max 50 characters.';
    return false;
  }
  return true;
}

function validateTags() {
  const v = els.tags.value || '';
  if (v.length > 250) {
    els.errors.tags.textContent = 'Tags must be max 250 characters.';
    return false;
  }
  if (v && !/^[A-Za-z0-9, ]*$/.test(v)) {
    els.errors.tags.textContent = 'Tags may contain only letters, numbers, commas and spaces.';
    return false;
  }
  return true;
}

function validateThumbnail() {
  const f = els.thumbnail.files?.[0];
  if (!f) return true;
  if (!/^image\/(png|jpeg|jpg)$/.test(f.type)) {
    els.errors.thumbnail.textContent = 'Thumbnail must be a jpg or png image.';
    els.thumbnail.value = '';
    return false;
  }
  if (f.size > 100 * 1024) {
    els.errors.thumbnail.textContent = 'Thumbnail must be ≤ 100 KB.';
    els.thumbnail.value = '';
    return false;
  }
  return true;
}

function onMediaSelected(which) {
  const mapping = { image: ['video','audio'], video: ['image','audio'], audio: ['image','video'] };
  const selected = els[which].files?.length > 0;
  if (selected) {
    mapping[which].forEach(k => { els[k].disabled = true; els[k].value = ''; });
  } else {
    onMediaCleared();
  }
}

function onMediaCleared() {
  const cat = els.category.value;
  // re-enable allowed media unless category prohibits them
  if (cat === 'fact sheet' || cat === 'moodboard') {
    els.audio.disabled = true; els.video.disabled = true;
    return;
  }
  if (cat === 'demo') {
    els.image.disabled = true; els.link.disabled = true; els.fullText.disabled = true;
    return;
  }
  // otherwise allow all media
  els.image.disabled = false; els.video.disabled = false; els.audio.disabled = false;
}

function validateLink() {
  const v = els.link.value.trim();
  if (!v) return true;
  try {
    const u = new URL(v);
    if (u.protocol !== 'https:') {
      els.errors.link.textContent = 'Link must begin with https.';
      return false;
    }
  } catch (err) {
    els.errors.link.textContent = 'Invalid URL.';
    return false;
  }
  return true;
}

function validateFullText() {
  const v = els.fullText.value || '';
  if (v.length > 300) {
    els.errors.fullText.textContent = 'Full Text must be max 300 characters.';
    return false;
  }
  return true;
}

async function validateAll() {
  clearErrors();
  let ok = true;
  if (!els.category.value) {
    els.errors.category.textContent = 'Please select a category.';
    ok = false;
  }
  ok = validateFilename() && ok;
  ok = validateTitle() && ok;
  ok = validateTags() && ok;
  ok = validateThumbnail() && ok;
  ok = validateFullText() && ok;
  ok = validateLink() && ok;

  if (els.image.files[0]) {
    const f = els.image.files[0];
    if (!/^image\/(png|jpeg|jpg)$/.test(f.type)) { els.errors.image.textContent = 'Image must be jpg/jpeg/png.'; ok = false; }
  }
  if (els.video.files[0]) {
    const f = els.video.files[0];
    if (f.type !== 'video/mp4') { els.errors.video.textContent = 'Video must be mp4.'; ok = false; }
  }
  if (els.audio.files[0]) {
    const f = els.audio.files[0];
    if (!/audio\/(mpeg|mp3)/.test(f.type)) { els.errors.audio.textContent = 'Audio must be mp3.'; ok = false; }
  }

  const hasMediaOrLink = Boolean(els.audio.files[0] || els.video.files[0] || els.link.value.trim());
  if (!hasMediaOrLink && !els.fullText.value.trim()) {
    els.errors.fullText.textContent = 'Full Text is required when no audio, video, or link is present.';
    ok = false;
  }

  return ok;
}

function collectFormValues() {
  return {
    category: els.category.value,
    filename: els.filename.value,
    title: els.title.value,
    tags: els.tags.value,
    thumbnail: els.thumbnail.files?.[0] || null,
    image: els.image.files?.[0] || null,
    video: els.video.files?.[0] || null,
    audio: els.audio.files?.[0] || null,
    link: els.link.value.trim(),
    shortDescription: els.shortDescription.value,
    fullText: els.fullText.value
  };
}

initForm();

export { /* exported only to document via events */ };