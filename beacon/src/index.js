import { sendOnLoadMetric } from '../../utils/networking';

const spaceId = document.currentScript.getAttribute('data-id');
if (!spaceId) {
  console.warn('Zesty Beacon script has been added but no space ID was given!');
} else {
  sendOnLoadMetric(spaceId);
}
