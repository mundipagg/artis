import { changeScreenSize, addPageInfo, showFooterButton } from './'

describe('actions', () => {
  it('should create an action to change screen size', () => {
    const size = 1000

    const expectedAction = {
      type: 'CHANGE_SCREEN_SIZE',
      size,
    }

    expect(changeScreenSize(size)).toEqual(expectedAction)
  })

  it('should create an action to add page infos', () => {
    const payload = {
      page: 'groot',
      pageInfo: {
        name: 'I\'m groot',
      },
    }

    const expectedAction = {
      type: 'ADD_PAGE_INFO',
      payload,
    }

    expect(addPageInfo(payload)).toEqual(expectedAction)
  })

  it('should create an action to handle footer button', () => {
    const isVisible = false

    const expectedAction = {
      type: 'SHOW_FOOTER_BUTTON',
      isVisible,
    }

    expect(showFooterButton(isVisible)).toEqual(expectedAction)
  })
})
