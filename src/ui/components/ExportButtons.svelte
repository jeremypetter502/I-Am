<script>
  export let profile;
  import { toIamMarkdown, sanitizeContextFile } from '../services/profileService.js';
  import sessionService from '../services/sessionService.js';

  function buildExportProfile(inputProfile) {
    const exportProfile = inputProfile ? { ...inputProfile } : {};
    const rootProfile = exportProfile.profile && typeof exportProfile.profile === 'object'
      ? { ...exportProfile.profile }
      : { ...exportProfile };
    const savedBase = sessionService.loadBaseContext();

    exportProfile.profile = rootProfile;
    if (savedBase && typeof savedBase === 'object') {
      if (!exportProfile.profile.base || Object.keys(exportProfile.profile.base).length === 0) {
        exportProfile.profile.base = { ...savedBase };
      }
    }
    return sanitizeContextFile(exportProfile);
  }

  function downloadIamMarkdown() {
    const text = toIamMarkdown(buildExportProfile(profile));
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'profile.context.iam.md';
    a.click();
    URL.revokeObjectURL(url);
  }
</script>
<div class="exports">
  <button class="primary" on:click={downloadIamMarkdown}>Download IAM Markdown</button>
</div>
<style>
  .exports button {
    margin-right: 8px;
    padding: 12px 24px;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
  }

  @media (max-width: 768px) {
    .exports button {
      font-size: 0.9rem;
      padding: 10px 16px;
      width: 100%;
    }
  }
</style>